import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, X, Check, Clock, Users, Trophy, Rocket } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { sessionService } from "../../services/sessionService";
import type { Session } from "../../types/database";

type Notification = {
	id: string;
	type: "session_invite" | "match_completed" | "collaboration_completed";
	sessionType: "match" | "collaboration";
	session: Session;
	createdAt: string;
	read: boolean;
};

const NotificationCenter = () => {
	const navigate = useNavigate();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadNotifications();

		const setupSubscription = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				console.warn("No user found, skipping notification subscription");
				return;
			}

			console.log("🔔 Setting up notification subscription for user:", user.id);

			const channelName = `user-notifications-${user.id}-${Date.now()}`;

			const channel = supabase
				.channel(channelName)
				// Listen for new session invites (both match and collaboration)
				.on(
					"postgres_changes",
					{
						event: "INSERT",
						schema: "public",
						table: "session_participants",
						filter: `user_id=eq.${user.id}`,
					},
					async (payload) => {
						console.log("🔔 New invitation received:", payload);
						await loadNotifications();

						if (Notification.permission === "granted") {
							new Notification("New Session Invite!", {
								body: "You have been invited to join a coding session",
								icon: "/logo.png",
							});
						}
					}
				)
				// Listen for updates to session invites
				.on(
					"postgres_changes",
					{
						event: "UPDATE",
						schema: "public",
						table: "session_participants",
						filter: `user_id=eq.${user.id}`,
					},
					async () => {
						await loadNotifications();
					}
				)
				// Listen for match/session completed notifications
				.on(
					"postgres_changes",
					{
						event: "INSERT",
						schema: "public",
						table: "summary_notifications",
						filter: `user_id=eq.${user.id}`,
					},
					async (payload) => {
						console.log("🎉 Session completed notification received:", payload);
						await loadNotifications();

						if (Notification.permission === "granted") {
							new Notification("Session Completed!", {
								body: "Your session has finished! View the summary now.",
								icon: "/logo.png",
							});
						}
					}
				)
				.on(
					"postgres_changes",
					{
						event: "UPDATE",
						schema: "public",
						table: "summary_notifications",
						filter: `user_id=eq.${user.id}`,
					},
					async () => {
						await loadNotifications();
					}
				)
				.subscribe((status) => {
					console.log("📡 Notification subscription status:", status);
					if (
						status === "CHANNEL_ERROR" ||
						status === "TIMED_OUT" ||
						status === "CLOSED"
					) {
						setTimeout(() => setupSubscription(), 2000);
					}
				});

			return () => {
				supabase.removeChannel(channel);
			};
		};

		const cleanup = setupSubscription();
		const pollInterval = setInterval(() => loadNotifications(), 15000);

		return () => {
			cleanup.then((cleanupFn) => cleanupFn && cleanupFn());
			clearInterval(pollInterval);
		};
	}, []);

	const loadNotifications = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			// Get pending invitations
			const { data: invites, error: inviteError } = await supabase
				.from("session_participants")
				.select(
					`
          id,
          session_id,
          joined_at,
          session:sessions(
            *,
            problem:problems(*),
            host:profiles(*)
          )
        `
				)
				.eq("user_id", user.id)
				.eq("status", "invited")
				.order("joined_at", { ascending: false });

			if (inviteError) throw inviteError;

			// Get match/session completed notifications (unread)
			const { data: completedSessions, error: completedError } = await supabase
				.from("summary_notifications")
				.select(
					`
          id,
          session_id,
          session_type,
          created_at,
          read,
          session:sessions(
            *,
            problem:problems(*),
            host:profiles(*)
          )
        `
				)
				.eq("user_id", user.id)
				.eq("read", false)
				.order("created_at", { ascending: false });

			if (completedError) throw completedError;

			const inviteNotifs: Notification[] = (invites || []).map(
				(invite: any) => ({
					id: invite.id,
					type: "session_invite" as const,
					sessionType: invite.session?.type || "match",
					session: invite.session,
					createdAt: invite.joined_at,
					read: false,
				})
			);

			const completedNotifs: Notification[] = (completedSessions || []).map(
				(session: any) => ({
					id: session.id,
					type:
						session.session?.type === "collaboration"
							? ("collaboration_completed" as const)
							: ("match_completed" as const),
					sessionType: session.session?.type || session.session_type || "match",
					session: session.session,
					createdAt: session.created_at,
					read: session.read,
				})
			);

			setNotifications([...completedNotifs, ...inviteNotifs]);
		} catch (error) {
			console.error("Error loading notifications:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleAcceptInvite = async (notification: Notification) => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			await sessionService.updateParticipantStatus(
				notification.session.id,
				user.id,
				"joined"
			);

			setNotifications((prev) => prev.filter((n) => n.id !== notification.id));

			// Navigate based on session type
			const path =
				notification.sessionType === "collaboration"
					? `/collaboration/${notification.session.id}`
					: `/match/${notification.session.id}`;

			navigate(path);
			setIsOpen(false);
		} catch (error) {
			console.error("Error accepting invite:", error);
			alert("Failed to accept invitation");
		}
	};

	const handleDeclineInvite = async (notification: Notification) => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			await sessionService.updateParticipantStatus(
				notification.session.id,
				user.id,
				"declined"
			);

			setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
		} catch (error) {
			console.error("Error declining invite:", error);
			alert("Failed to decline invitation");
		}
	};

	const handleViewSummary = async (notification: Notification) => {
		try {
			// Mark notification as read
			await supabase
				.from("summary_notifications")
				.update({ read: true })
				.eq("id", notification.id);

			setNotifications((prev) => prev.filter((n) => n.id !== notification.id));

			// Navigate based on session type
			const path =
				notification.sessionType === "collaboration"
					? `/collaboration-summary/${notification.session.id}`
					: `/match-summary/${notification.session.id}`;

			navigate(path);
			setIsOpen(false);
		} catch (error) {
			console.error("Error viewing summary:", error);
		}
	};

	const unreadCount = notifications.filter((n) => !n.read).length;

	return (
		<div className="relative">
			{/* Bell Icon */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="relative p-2 rounded-full hover:bg-gray-700 transition"
			>
				<Bell size={20} className="text-gray-300" />
				{unreadCount > 0 && (
					<span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
						{unreadCount}
					</span>
				)}
			</button>

			{/* Notification Dropdown */}
			{isOpen && (
				<div className="absolute right-0 mt-2 w-96 bg-[#252525] border border-gray-700 rounded-lg shadow-xl z-50 max-h-[80vh] overflow-hidden flex flex-col">
					{/* Header */}
					<div className="p-4 border-b border-gray-700 flex justify-between items-center">
						<h3 className="font-semibold text-white">Notifications</h3>
						<button
							onClick={() => setIsOpen(false)}
							className="text-gray-400 hover:text-white"
						>
							<X size={18} />
						</button>
					</div>

					{/* Notifications List */}
					<div className="flex-1 overflow-y-auto">
						{loading ? (
							<div className="p-8 text-center text-gray-400">
								Loading notifications...
							</div>
						) : notifications.length === 0 ? (
							<div className="p-8 text-center text-gray-400">
								<Bell size={48} className="mx-auto mb-3 opacity-30" />
								<p>No new notifications</p>
							</div>
						) : (
							<div className="divide-y divide-gray-700">
								{notifications.map((notification) => (
									<div
										key={notification.id}
										className="p-4 hover:bg-gray-800 transition"
									>
										{notification.type === "match_completed" ||
										notification.type === "collaboration_completed" ? (
											// Session Completed Notification
											<div className="flex items-start gap-3">
												<div
													className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
														notification.sessionType === "collaboration"
															? "bg-purple-500"
															: "bg-[#FFD93D]"
													}`}
												>
													{notification.sessionType === "collaboration" ? (
														<Rocket size={20} className="text-white" />
													) : (
														<Trophy size={20} className="text-gray-900" />
													)}
												</div>

												<div className="flex-1 min-w-0">
													<p className="text-white font-medium">
														{notification.sessionType === "collaboration"
															? "Collaboration Completed! 🎉"
															: "Match Completed! 🎉"}
													</p>
													<p className="text-sm text-gray-400 mt-1">
														Your {notification.sessionType} for{" "}
														<span className="text-white">
															{notification.session.problem?.title}
														</span>{" "}
														has finished. View the results now!
													</p>

													<div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
														<span
															className={`px-2 py-0.5 rounded-full text-white ${
																notification.sessionType === "collaboration"
																	? "bg-purple-600"
																	: "bg-green-600"
															}`}
														>
															Completed
														</span>
													</div>

													<div className="mt-3">
														<button
															onClick={() => handleViewSummary(notification)}
															className={`w-full px-3 py-1.5 text-sm rounded-md flex items-center justify-center gap-1 transition font-medium ${
																notification.sessionType === "collaboration"
																	? "bg-purple-500 hover:bg-purple-600 text-white"
																	: "bg-[#FFD93D] hover:bg-[#e5c435] text-gray-900"
															}`}
														>
															{notification.sessionType === "collaboration" ? (
																<Rocket size={14} />
															) : (
																<Trophy size={14} />
															)}
															View Summary
														</button>
													</div>
												</div>
											</div>
										) : (
											// Session Invite Notification
											<div className="flex items-start gap-3">
												<div
													className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
														notification.sessionType === "collaboration"
															? "bg-purple-500"
															: "bg-[#5bc6ca]"
													}`}
												>
													{notification.sessionType === "collaboration" ? (
														<Rocket size={20} className="text-white" />
													) : (
														<Users size={20} className="text-white" />
													)}
												</div>

												<div className="flex-1 min-w-0">
													<p className="text-white font-medium">
														{notification.sessionType === "collaboration"
															? "Collaboration Invite"
															: "Coding Session Invite"}
													</p>
													<p className="text-sm text-gray-400 mt-1">
														<span
															className={
																notification.sessionType === "collaboration"
																	? "text-purple-400"
																	: "text-[#5bc6ca]"
															}
														>
															@{notification.session.host?.username}
														</span>{" "}
														invited you to{" "}
														{notification.sessionType === "collaboration"
															? "collaborate on"
															: "solve"}{" "}
														<span className="text-white">
															{notification.session.problem?.title}
														</span>
													</p>

													<div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
														<span className="flex items-center">
															<Clock size={12} className="mr-1" />
															{notification.session.time_limit} min
														</span>
														<span className="flex items-center">
															<Users size={12} className="mr-1" />
															{notification.session.max_players}{" "}
															{notification.sessionType === "collaboration"
																? "collaborators"
																: "players"}
														</span>
														<span
															className={`px-2 py-0.5 rounded-full text-white ${
																notification.session.problem?.difficulty ===
																"Easy"
																	? "bg-green-600"
																	: notification.session.problem?.difficulty ===
																	  "Medium"
																	? "bg-yellow-600"
																	: "bg-red-600"
															}`}
														>
															{notification.session.problem?.difficulty}
														</span>
													</div>

													<div className="mt-3 flex gap-2">
														<button
															onClick={() => handleAcceptInvite(notification)}
															className={`flex-1 px-3 py-1.5 text-white text-sm rounded-md flex items-center justify-center gap-1 transition ${
																notification.sessionType === "collaboration"
																	? "bg-purple-500 hover:bg-purple-600"
																	: "bg-[#5bc6ca] hover:bg-[#48aeb3]"
															}`}
														>
															<Check size={14} />
															Accept
														</button>
														<button
															onClick={() => handleDeclineInvite(notification)}
															className="flex-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center justify-center gap-1 transition"
														>
															<X size={14} />
															Decline
														</button>
													</div>
												</div>
											</div>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default NotificationCenter;
