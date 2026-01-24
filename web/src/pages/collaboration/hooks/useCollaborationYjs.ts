import { useState, useEffect, useRef, useCallback } from "react";
import * as Y from "yjs";
import type { Awareness } from "y-protocols/awareness";
import { SupabaseYjsProvider } from "../../../services/yjs/supabaseYjsProvider";
import {
	getUserColor,
	type UserAwareness,
} from "../../../services/yjs/collaborationDocument";
import type {
	CollaborationDocumentInterface,
	UserAwarenessState,
} from "../types";

/**
 * Adapter class that wraps SupabaseYjsProvider to match CollaborationDocument interface
 */
class CollaborationDocumentAdapter implements CollaborationDocumentInterface {
	public readonly provider: SupabaseYjsProvider;
	public readonly sessionId: string;
	public readonly fileId: string;
	private _isConnected: boolean = false;

	constructor(
		provider: SupabaseYjsProvider,
		sessionId: string,
		fileId: string = "main",
	) {
		this.provider = provider;
		this.sessionId = sessionId;
		this.fileId = fileId;
	}

	get ydoc(): Y.Doc {
		return this.provider.doc;
	}

	get awareness(): Awareness {
		return this.provider.awareness;
	}

	getText(): Y.Text {
		return this.provider.doc.getText("content");
	}

	connect(): void {
		this._isConnected = true;
	}

	disconnect(): void {
		this.provider.destroy();
		this._isConnected = false;
	}

	isConnected(): boolean {
		return this._isConnected;
	}

	updateCursor(cursor: { lineNumber: number; column: number } | null): void {
		const localState = this.provider.awareness.getLocalState() as UserAwareness;
		this.provider.setLocalState({
			...localState,
			cursor,
		});
	}
}

interface UseCollaborationYjsProps {
	sessionId: string | undefined;
	currentUserId: string;
	currentUserName: string;
	starterCode: string;
}

interface UseCollaborationYjsReturn {
	collaborationDoc: CollaborationDocumentInterface | null;
	isYjsConnected: boolean;
	remoteCursors: Map<number, UserAwarenessState>;
	getCurrentCode: () => string;
	yjsProviderRef: React.MutableRefObject<SupabaseYjsProvider | null>;
}

export function useCollaborationYjs({
	sessionId,
	currentUserId,
	currentUserName,
	starterCode,
}: UseCollaborationYjsProps): UseCollaborationYjsReturn {
	const yjsProviderRef = useRef<SupabaseYjsProvider | null>(null);
	const [collaborationDoc, setCollaborationDoc] =
		useState<CollaborationDocumentInterface | null>(null);
	const [isYjsConnected, setIsYjsConnected] = useState(false);
	const [remoteCursors, setRemoteCursors] = useState<
		Map<number, UserAwarenessState>
	>(new Map());

	// Initialize Yjs provider
	useEffect(() => {
		if (!sessionId || !currentUserId || !currentUserName) {
			return;
		}

		const roomName = `collab-${sessionId}`;
		const doc = new Y.Doc();

		const provider = new SupabaseYjsProvider(roomName, doc, currentUserId);

		const colors = getUserColor(currentUserId);
		provider.setLocalState({
			user: {
				id: currentUserId,
				name: currentUserName,
				color: colors.color,
				colorLight: colors.light,
			},
			cursor: null,
		});

		provider.onSync(() => {
			console.log(`[Yjs] Synced for collaboration session: ${sessionId}`);
			setIsYjsConnected(true);

			const ytext = provider.doc.getText("content");
			if (ytext.toString() === "" && starterCode) {
				ytext.insert(0, starterCode);
			}

			const adapter = new CollaborationDocumentAdapter(
				provider,
				sessionId,
				"main",
			);
			adapter.connect();
			setCollaborationDoc(adapter);
		});

		provider.onAwarenessChange((_states: any) => {
			setRemoteCursors(_states as Map<number, UserAwarenessState>);
		});

		yjsProviderRef.current = provider;

		return () => {
			provider.destroy();
			yjsProviderRef.current = null;
			setCollaborationDoc(null);
		};
	}, [sessionId, currentUserId, currentUserName, starterCode]);

	// Get current code from Yjs document
	const getCurrentCode = useCallback((): string => {
		if (yjsProviderRef.current) {
			return yjsProviderRef.current.doc.getText("content").toString();
		}
		return starterCode;
	}, [starterCode]);

	return {
		collaborationDoc,
		isYjsConnected,
		remoteCursors,
		getCurrentCode,
		yjsProviderRef,
	};
}
