import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { sessionService } from "../../services/sessionService";
import type { Notification } from "../types";

export const useNotifications = () => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);

	const loadNotifications = useCallback(async () => {
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
        `,
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
        `,
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
				}),
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
				}),
			);

			setNotifications([...completedNotifs, ...inviteNotifs]);
		} catch (error) {
			console.error("Error loading notifications:", error);
		} finally {
			setLoading(false);
		}
	}, []);

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
					},
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
					},
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
					},
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
					},
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
	}, [loadNotifications]);

	const removeNotification = useCallback((id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	}, []);

	const acceptInvite = useCallback(
		async (notification: Notification): Promise<string | null> => {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user) return null;

				await sessionService.updateParticipantStatus(
					notification.session.id,
					user.id,
					"joined",
				);

				removeNotification(notification.id);

				// Return the navigation path
				return notification.sessionType === "collaboration"
					? `/collaboration/${notification.session.id}`
					: `/match/${notification.session.id}`;
			} catch (error) {
				console.error("Error accepting invite:", error);
				throw error;
			}
		},
		[removeNotification],
	);

	const declineInvite = useCallback(
		async (notification: Notification): Promise<void> => {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user) return;

				await sessionService.updateParticipantStatus(
					notification.session.id,
					user.id,
					"declined",
				);

				removeNotification(notification.id);
			} catch (error) {
				console.error("Error declining invite:", error);
				throw error;
			}
		},
		[removeNotification],
	);

	const markAsReadAndGetPath = useCallback(
		async (notification: Notification): Promise<string | null> => {
			try {
				// Mark notification as read
				await supabase
					.from("summary_notifications")
					.update({ read: true })
					.eq("id", notification.id);

				removeNotification(notification.id);

				// Return the navigation path
				return notification.sessionType === "collaboration"
					? `/collaboration-summary/${notification.session.id}`
					: `/match-summary/${notification.session.id}`;
			} catch (error) {
				console.error("Error viewing summary:", error);
				return null;
			}
		},
		[removeNotification],
	);

	const unreadCount = notifications.filter((n) => !n.read).length;

	return {
		notifications,
		loading,
		unreadCount,
		acceptInvite,
		declineInvite,
		markAsReadAndGetPath,
	};
};
