import type { Session } from "../types/database";

export type NotificationType =
	| "session_invite"
	| "match_completed"
	| "collaboration_completed";

export type SessionType = "match" | "collaboration";

export interface Notification {
	id: string;
	type: NotificationType;
	sessionType: SessionType;
	session: Session;
	createdAt: string;
	read: boolean;
}

export interface NotificationCenterProps {
	onOpenChange?: (isOpen: boolean) => void;
	closeSignal?: number; // External signal to close the dropdown (increments when parent wants to close)
}
