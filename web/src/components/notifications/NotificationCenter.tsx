import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, X, Check, Clock, Users, Trophy } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { sessionService } from "../../services/sessionService";
import type { Session } from "../../types/database";

type Notification = {
	id: string;
	type: "session_invite" | "match_completed";
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

		// Set up real-time subscription
		const setupSubscription = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				console.warn("No user found, skipping notification subscription");
				return;
			}

			console.log("🔔 Setting up notification subscription for user:", user.id);

			// Create a unique channel name
			const channelName = `user-notifications-${user.id}-${Date.now()}`;
			console.log("📡 Channel name:", channelName);

			const channel = supabase
				.channel(channelName)
				// Listen for new session invites
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

						// Browser notification
						if (Notification.permission === "granted") {
							new Notification("New Coding Session Invite!", {
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
					async (payload) => {
						console.log("🔔 Participant status updated:", payload);
						await loadNotifications();
					}
				)
				// Listen for match completed notifications - CRITICAL
				.on(
					"postgres_changes",
					{
						event: "INSERT",
						schema: "public",
						table: "match_summary_notifications",
						filter: `user_id=eq.${user.id}`,
					},
					async (payload) => {
						console.log("🎉 Match completed notification received:", payload);

						// Force reload notifications
						await loadNotifications();

						// Browser notification
						if (Notification.permission === "granted") {
							new Notification("Match Completed!", {
								body: "Your match has finished! View the summary now.",
								icon: "/logo.png",
							});
						}
					}
				)
				// Listen for DELETE events (when notifications are marked as read)
				.on(
					"postgres_changes",
					{
						event: "UPDATE",
						schema: "public",
						table: "match_summary_notifications",
						filter: `user_id=eq.${user.id}`,
					},
					async (payload) => {
						console.log("🔔 Notification updated:", payload);
						await loadNotifications();
					}
				)
				.subscribe((status) => {
					console.log("📡 Notification subscription status:", status);
					if (status === "SUBSCRIBED") {
						console.log("✅ Successfully subscribed to notifications channel");
					} else if (status === "CHANNEL_ERROR") {
						console.error("❌ Subscription error - retrying...");
						setTimeout(() => setupSubscription(), 2000);
					} else if (status === "TIMED_OUT") {
						console.error("⏱️ Subscription timed out - retrying...");
						setTimeout(() => setupSubscription(), 2000);
					} else if (status === "CLOSED") {
						console.warn("⚠️ Channel closed - retrying...");
						setTimeout(() => setupSubscription(), 2000);
					}
				});

			return () => {
				console.log("Cleaning up notification subscription");
				supabase.removeChannel(channel);
			};
		};

		const cleanup = setupSubscription();

		// Also set up periodic polling as backup (every 10 seconds for testing, 30 in production)
		const pollInterval = setInterval(() => {
			console.log("🔄 Polling for notifications (backup)");
			loadNotifications();
		}, 10000); // 10 seconds for testing

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
			if (!user) {
				console.log("No user found, skipping notification load");
				return;
			}

			console.log("📥 Loading notifications for user:", user.id);

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

			if (inviteError) {
				console.error("Error loading invites:", inviteError);
				throw inviteError;
			}

			console.log("📨 Invites loaded:", invites?.length || 0);

			// Get match completed notifications (unread)
			const { data: completedMatches, error: completedError } = await supabase
				.from("match_summary_notifications")
				.select(
					`
          id,
          session_id,
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

			if (completedError) {
				console.error("Error loading completed matches:", completedError);
				throw completedError;
			}

			console.log(
				"🏆 Completed matches loaded:",
				completedMatches?.length || 0,
				completedMatches
			);

			const inviteNotifs: Notification[] = (invites || []).map(
				(invite: any) => ({
					id: invite.id,
					type: "session_invite" as const,
					session: invite.session,
					createdAt: invite.joined_at,
					read: false,
				})
			);

			const completedNotifs: Notification[] = (completedMatches || []).map(
				(match: any) => ({
					id: match.id,
					type: "match_completed" as const,
					session: match.session,
					createdAt: match.created_at,
					read: match.read,
				})
			);

			const allNotifs = [...completedNotifs, ...inviteNotifs];
			console.log("📋 Total notifications:", allNotifs.length);

			setNotifications(allNotifs);
		} catch (error) {
			console.error("Error loading notifications:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleAcceptInvite = async (notification: Notification) => {
		try {
			await sessionService.updateParticipantStatus(
				notification.session.id,
				(
					await supabase.auth.getUser()
				).data.user!.id,
				"joined"
			);

			setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
			navigate(`/match/${notification.session.id}`);
			setIsOpen(false);
		} catch (error) {
			console.error("Error accepting invite:", error);
			alert("Failed to accept invitation");
		}
	};

	const handleDeclineInvite = async (notification: Notification) => {
		try {
			await sessionService.updateParticipantStatus(
				notification.session.id,
				(
					await supabase.auth.getUser()
				).data.user!.id,
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
			console.log("📊 Viewing summary for session:", notification.session.id);

			// Mark notification as read
			const { error } = await supabase
				.from("match_summary_notifications")
				.update({ read: true })
				.eq("id", notification.id);

			if (error) {
				console.error("Error marking notification as read:", error);
			}

			// Remove from local state
			setNotifications((prev) => prev.filter((n) => n.id !== notification.id));

			// Navigate to summary
			navigate(`/match-summary/${notification.session.id}`);
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
										{notification.type === "match_completed" ? (
											// Match Completed Notification
											<div className="flex items-start gap-3">
												<div className="w-10 h-10 rounded-full bg-[#FFD93D] flex items-center justify-center flex-shrink-0">
													<Trophy size={20} className="text-gray-900" />
												</div>

												<div className="flex-1 min-w-0">
													<p className="text-white font-medium">
														Match Completed! 🎉
													</p>
													<p className="text-sm text-gray-400 mt-1">
														Your match for{" "}
														<span className="text-white">
															{notification.session.problem?.title}
														</span>{" "}
														has finished. View the results now!
													</p>

													{/* Session Details */}
													<div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
														<span className="px-2 py-0.5 rounded-full bg-green-600 text-white">
															Completed
														</span>
													</div>

													{/* Action Button */}
													<div className="mt-3">
														<button
															onClick={() => handleViewSummary(notification)}
															className="w-full px-3 py-1.5 bg-[#FFD93D] hover:bg-[#e5c435] text-gray-900 text-sm rounded-md flex items-center justify-center gap-1 transition font-medium"
														>
															<Trophy size={14} />
															View Match Summary
														</button>
													</div>
												</div>
											</div>
										) : (
											// Session Invite Notification
											<div className="flex items-start gap-3">
												<div className="w-10 h-10 rounded-full bg-[#5bc6ca] flex items-center justify-center flex-shrink-0">
													<Users size={20} className="text-white" />
												</div>

												<div className="flex-1 min-w-0">
													<p className="text-white font-medium">
														Coding Session Invite
													</p>
													<p className="text-sm text-gray-400 mt-1">
														<span className="text-[#5bc6ca]">
															@{notification.session.host?.username}
														</span>{" "}
														invited you to solve{" "}
														<span className="text-white">
															{notification.session.problem?.title}
														</span>
													</p>

													{/* Session Details */}
													<div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
														<span className="flex items-center">
															<Clock size={12} className="mr-1" />
															{notification.session.time_limit} min
														</span>
														<span className="flex items-center">
															<Users size={12} className="mr-1" />
															{notification.session.max_players} players
														</span>
														<span className="px-2 py-0.5 rounded-full bg-yellow-600 text-white">
															{notification.session.problem?.difficulty}
														</span>
													</div>

													{/* Action Buttons */}
													<div className="mt-3 flex gap-2">
														<button
															onClick={() => handleAcceptInvite(notification)}
															className="flex-1 px-3 py-1.5 bg-[#5bc6ca] hover:bg-[#48aeb3] text-white text-sm rounded-md flex items-center justify-center gap-1 transition"
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
