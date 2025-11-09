import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, X, Check, Clock, Users } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { sessionService } from "../../services/sessionService";
import type { Session } from "../../types/database";

type Notification = {
	id: string;
	type: "session_invite";
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

			if (!user) return;

			const channel = supabase
				.channel(`user-invites:${user.id}`)
				.on(
					"postgres_changes",
					{
						event: "INSERT",
						schema: "public",
						table: "session_participants",
						filter: `user_id=eq.${user.id}`,
					},
					async (payload) => {
						console.log("New invitation received:", payload);

						// Small delay to ensure database transaction is complete
						setTimeout(async () => {
							await loadNotifications();
						}, 100);

						// Show browser notification if permitted
						if (Notification.permission === "granted") {
							new Notification("New Coding Session Invite!", {
								body: "You have been invited to join a coding session",
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
						table: "session_participants",
						filter: `user_id=eq.${user.id}`,
					},
					async (payload) => {
						console.log("Participant status updated:", payload);
						// Reload notifications to update the list
						setTimeout(async () => {
							await loadNotifications();
						}, 100);
					}
				)
				.subscribe((status) => {
					console.log("Subscription status:", status);
					if (status === "SUBSCRIBED") {
						console.log("Successfully subscribed to notifications channel");
					}
				});

			return () => {
				supabase.removeChannel(channel);
			};
		};

		const cleanup = setupSubscription();

		// Also set up periodic polling as backup (every 10 seconds)
		const pollInterval = setInterval(() => {
			loadNotifications();
		}, 10000);

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

			// Get all pending invitations
			const { data: invites, error } = await supabase
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

			if (error) throw error;

			const notifs: Notification[] = (invites || []).map((invite: any) => ({
				id: invite.id,
				type: "session_invite",
				session: invite.session,
				createdAt: invite.joined_at,
				read: false,
			}));

			setNotifications(notifs);
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

			// Remove from notifications
			setNotifications((prev) => prev.filter((n) => n.id !== notification.id));

			// Navigate to match
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

			// Remove from notifications
			setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
		} catch (error) {
			console.error("Error declining invite:", error);
			alert("Failed to decline invitation");
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
										<div className="flex items-start gap-3">
											<div className="w-10 h-10 rounded-full bg-[#5bc6ca] flex items-center justify-center flex-shrink-0">
												<Users size={20} className="text-white" />
											</div>

											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between gap-2">
													<div className="flex-1">
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
													</div>
												</div>

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
