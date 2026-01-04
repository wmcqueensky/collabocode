import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";

/**
 * User awareness state - tracks cursor position and user info
 */
export interface UserAwareness {
	user?: {
		id: string;
		name: string;
		color: string;
		colorLight: string;
	};
	cursor: {
		lineNumber: number;
		column: number;
	} | null;
}

/**
 * CollaborationDocument interface - defines the contract for collaborative editing
 * This can be implemented by different providers (SupabaseYjsProvider, etc.)
 */
export interface CollaborationDocument {
	/** The Yjs document */
	readonly ydoc: Y.Doc;

	/** The awareness instance for cursor tracking */
	readonly awareness: Awareness;

	/** Session ID this document belongs to */
	readonly sessionId: string;

	/** File ID within the session (use "main" for single-file) */
	readonly fileId: string;

	/** Get the Y.Text instance for the document content */
	getText(): Y.Text;

	/** Connect to the collaboration server */
	connect(): void;

	/** Disconnect from the collaboration server */
	disconnect(): void;

	/** Check if currently connected */
	isConnected(): boolean;

	/** Update local user's cursor position */
	updateCursor(cursor: { lineNumber: number; column: number } | null): void;
}

/**
 * Color palette for user cursors
 */
const USER_COLORS = [
	{ color: "#FF6B6B", light: "rgba(255, 107, 107, 0.2)" }, // Red
	{ color: "#4ECDC4", light: "rgba(78, 205, 196, 0.2)" }, // Teal
	{ color: "#45B7D1", light: "rgba(69, 183, 209, 0.2)" }, // Blue
	{ color: "#96CEB4", light: "rgba(150, 206, 180, 0.2)" }, // Green
	{ color: "#FFEAA7", light: "rgba(255, 234, 167, 0.2)" }, // Yellow
	{ color: "#DDA0DD", light: "rgba(221, 160, 221, 0.2)" }, // Plum
	{ color: "#98D8C8", light: "rgba(152, 216, 200, 0.2)" }, // Mint
	{ color: "#F7DC6F", light: "rgba(247, 220, 111, 0.2)" }, // Gold
	{ color: "#BB8FCE", light: "rgba(187, 143, 206, 0.2)" }, // Purple
	{ color: "#85C1E9", light: "rgba(133, 193, 233, 0.2)" }, // Sky
];

/**
 * Get a consistent color for a user based on their ID
 */
export function getUserColor(userId: string): { color: string; light: string } {
	// Generate a hash from the user ID
	let hash = 0;
	for (let i = 0; i < userId.length; i++) {
		const char = userId.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32bit integer
	}

	// Use the hash to pick a color
	const index = Math.abs(hash) % USER_COLORS.length;
	return USER_COLORS[index];
}

/**
 * Format awareness states into a map for easier consumption
 */
export function formatAwarenessStates(
	awareness: Awareness
): Map<number, UserAwareness> {
	const states = new Map<number, UserAwareness>();
	awareness.getStates().forEach((state, clientId) => {
		if (state && typeof state === "object") {
			states.set(clientId, state as UserAwareness);
		}
	});
	return states;
}
