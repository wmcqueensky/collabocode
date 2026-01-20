import type { Notification } from "../types";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { CompletedNotificationItem } from "./CompletedNotificationItem";
import { InviteNotificationItem } from "./InviteNotificationItem";

interface NotificationListProps {
	notifications: Notification[];
	loading: boolean;
	onAcceptInvite: (notification: Notification) => void;
	onDeclineInvite: (notification: Notification) => void;
	onViewSummary: (notification: Notification) => void;
}

export const NotificationList = ({
	notifications,
	loading,
	onAcceptInvite,
	onDeclineInvite,
	onViewSummary,
}: NotificationListProps) => {
	if (loading) {
		return <LoadingState />;
	}

	if (notifications.length === 0) {
		return <EmptyState />;
	}

	return (
		<div className="divide-y divide-gray-700">
			{notifications.map((notification) => (
				<div key={notification.id} className="p-4 hover:bg-gray-800 transition">
					{notification.type === "match_completed" ||
					notification.type === "collaboration_completed" ? (
						<CompletedNotificationItem
							notification={notification}
							onViewSummary={onViewSummary}
						/>
					) : (
						<InviteNotificationItem
							notification={notification}
							onAccept={onAcceptInvite}
							onDecline={onDeclineInvite}
						/>
					)}
				</div>
			))}
		</div>
	);
};
