import { useState, useEffect, useCallback } from "react";
import {
	sessionActivityService,
	type SessionActivity,
} from "../../../services/sessionActivityService";
import { supabase } from "../../../lib/supabase";
import { formatActivityTimestamp } from "../constants";
import type { Activity, ActivityType } from "../types";

interface UseMatchActivitiesProps {
	sessionId: string | undefined;
	currentUserId: string;
	currentUsername: string;
	enabled: boolean;
}

interface UseMatchActivitiesReturn {
	activities: Activity[];
	addActivity: (type: ActivityType, message: string) => Promise<void>;
}

export const useMatchActivities = ({
	sessionId,
	currentUserId,
	currentUsername,
	enabled,
}: UseMatchActivitiesProps): UseMatchActivitiesReturn => {
	const [activities, setActivities] = useState<Activity[]>([]);

	// Format activity from DB to UI
	const formatActivity = useCallback(
		(dbActivity: SessionActivity): Activity => {
			const isCurrentUser = dbActivity.user_id === currentUserId;
			const timestamp = formatActivityTimestamp(dbActivity.created_at);

			let message = dbActivity.message;
			if (isCurrentUser && !message.startsWith("You")) {
				message = message.replace(dbActivity.username, "You");
			}

			return {
				id: dbActivity.id,
				type: dbActivity.type,
				message,
				timestamp,
				userId: dbActivity.user_id,
			};
		},
		[currentUserId],
	);

	// Load and subscribe to activities
	useEffect(() => {
		if (!sessionId || !enabled || !currentUserId) return;

		const loadActivities = async () => {
			try {
				const existingActivities =
					await sessionActivityService.getActivities(sessionId);
				const formattedActivities: Activity[] = existingActivities.map(
					(a: SessionActivity) => formatActivity(a),
				);
				setActivities(formattedActivities);
			} catch (error) {
				console.error("Error loading activities:", error);
			}
		};

		loadActivities();

		const channel = sessionActivityService.subscribeToActivities(
			sessionId,
			(newActivity: SessionActivity) => {
				if (newActivity.user_id === currentUserId) {
					setActivities((prev) => {
						const tempIndex = prev.findIndex(
							(a) => a.id.startsWith("temp-") && a.userId === currentUserId,
						);
						if (tempIndex !== -1) {
							const updated = [...prev];
							updated[tempIndex] = formatActivity(newActivity);
							return updated;
						}
						if (prev.some((a) => a.id === newActivity.id)) {
							return prev;
						}
						return prev;
					});
					return;
				}

				setActivities((prev) => {
					if (prev.some((a) => a.id === newActivity.id)) {
						return prev;
					}
					return [formatActivity(newActivity), ...prev.slice(0, 9)];
				});
			},
		);

		return () => {
			supabase.removeChannel(channel);
		};
	}, [sessionId, enabled, currentUserId, formatActivity]);

	// Add activity helper
	const addActivity = useCallback(
		async (type: ActivityType, message: string) => {
			if (!sessionId || !currentUserId || !currentUsername) return;

			const tempId = `temp-${Date.now()}`;
			const newActivity: Activity = {
				id: tempId,
				type,
				message,
				timestamp: "now",
				userId: currentUserId,
			};

			setActivities((prev) => [newActivity, ...prev.slice(0, 9)]);

			try {
				await sessionActivityService.addActivity(
					sessionId,
					currentUserId,
					currentUsername,
					type,
					message.replace("You", currentUsername),
				);
			} catch (error) {
				console.error("Error saving activity:", error);
			}
		},
		[sessionId, currentUserId, currentUsername],
	);

	return {
		activities,
		addActivity,
	};
};
