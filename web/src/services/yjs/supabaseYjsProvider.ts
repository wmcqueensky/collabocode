import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import * as awarenessProtocol from "y-protocols/awareness";
import * as syncProtocol from "y-protocols/sync";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import { supabase } from "../../lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Message types for Yjs protocol
const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;
const MESSAGE_SYNC_REQUEST = 2;

/**
 * Supabase Realtime Provider for Yjs
 *
 * This uses Supabase Realtime Broadcast to sync Yjs documents
 * without needing a separate WebSocket server.
 *
 * FIXED: Better handling of remote updates and cursor independence
 */
export class SupabaseYjsProvider {
	public doc: Y.Doc;
	public awareness: Awareness;
	public synced: boolean = false;

	private channel: RealtimeChannel;
	private roomName: string;
	private userId: string;
	private clientId: number;
	private onSyncCallbacks: (() => void)[] = [];
	private onAwarenessCallbacks: ((states: Map<number, any>) => void)[] = [];
	private isDestroyed: boolean = false;
	private pendingUpdates: Uint8Array[] = [];
	private syncTimeout: NodeJS.Timeout | null = null;

	constructor(roomName: string, doc: Y.Doc, userId: string) {
		this.roomName = roomName;
		this.doc = doc;
		this.userId = userId;
		this.clientId = doc.clientID;
		this.awareness = new Awareness(doc);

		// Set up Supabase channel
		this.channel = supabase.channel(`yjs-${roomName}`, {
			config: {
				broadcast: {
					self: false, // Don't receive own broadcasts
				},
			},
		});

		this.setupChannel();
	}

	private setupChannel() {
		// Handle incoming Yjs sync messages
		this.channel.on("broadcast", { event: "yjs-sync" }, ({ payload }) => {
			if (this.isDestroyed) return;
			if (payload.senderId === this.userId) return;

			try {
				const data = this.base64ToUint8Array(payload.data);
				const decoder = decoding.createDecoder(data);
				const messageType = decoding.readVarUint(decoder);

				switch (messageType) {
					case MESSAGE_SYNC:
						this.handleSyncMessage(decoder, payload.senderId);
						break;
					case MESSAGE_AWARENESS:
						this.handleAwarenessMessage(decoder);
						break;
					case MESSAGE_SYNC_REQUEST:
						// Someone requested sync, send our state
						this.sendSyncState();
						break;
				}
			} catch (e) {
				console.error("[SupabaseYjs] Error processing message:", e);
			}
		});

		// Handle presence for awareness
		this.channel.on("presence", { event: "sync" }, () => {
			this.broadcastAwareness();
		});

		this.channel.on("presence", { event: "join" }, ({ key, newPresences }) => {
			console.log(`[SupabaseYjs] User joined: ${key}`, newPresences);
			// When someone joins, send them our current state
			this.sendSyncState();
		});

		// Subscribe to channel
		this.channel.subscribe(async (status) => {
			if (status === "SUBSCRIBED") {
				console.log(`[SupabaseYjs] Connected to room: ${this.roomName}`);

				// Track presence
				await this.channel.track({
					userId: this.userId,
					clientId: this.clientId,
					online_at: new Date().toISOString(),
				});

				// Set up document observers
				this.setupObservers();

				// Request sync from other clients
				this.requestSync();

				// Set synced after a delay to allow for initial sync
				this.syncTimeout = setTimeout(() => {
					if (!this.synced && !this.isDestroyed) {
						this.synced = true;
						this.onSyncCallbacks.forEach((cb) => cb());
					}
				}, 1000);
			}
		});
	}

	private setupObservers() {
		// Observe document changes - CRITICAL: Only send updates we create
		const updateHandler = (update: Uint8Array, origin: any) => {
			if (this.isDestroyed) return;

			// Only broadcast updates that originate locally (not from remote sync)
			// origin === this means the update came from applying a remote message
			if (origin === this) return;
			if (origin === "remote") return;

			// Broadcast the update
			const encoder = encoding.createEncoder();
			encoding.writeVarUint(encoder, MESSAGE_SYNC);
			syncProtocol.writeUpdate(encoder, update);
			this.broadcast(encoding.toUint8Array(encoder));
		};

		this.doc.on("update", updateHandler);

		// Observe awareness changes
		const awarenessHandler = ({ added, updated, removed }: any) => {
			if (this.isDestroyed) return;

			const changedClients = [...added, ...updated, ...removed];
			// Only broadcast if our own awareness changed
			if (changedClients.includes(this.doc.clientID)) {
				this.broadcastAwareness();
			}
		};

		this.awareness.on("update", awarenessHandler);

		// Store handlers for cleanup
		(this as any)._updateHandler = updateHandler;
		(this as any)._awarenessHandler = awarenessHandler;
	}

	private requestSync() {
		// Send sync request to get state from others
		const encoder = encoding.createEncoder();
		encoding.writeVarUint(encoder, MESSAGE_SYNC_REQUEST);
		this.broadcast(encoding.toUint8Array(encoder));

		// Also send sync step 1
		const syncEncoder = encoding.createEncoder();
		encoding.writeVarUint(syncEncoder, MESSAGE_SYNC);
		const syncMessage = encoding.createEncoder();
		syncProtocol.writeSyncStep1(syncMessage, this.doc);
		encoding.writeVarUint8Array(
			syncEncoder,
			encoding.toUint8Array(syncMessage)
		);
		this.broadcast(encoding.toUint8Array(syncEncoder));
	}

	private sendSyncState() {
		// Send our full document state
		const encoder = encoding.createEncoder();
		encoding.writeVarUint(encoder, MESSAGE_SYNC);

		const stateVector = Y.encodeStateVector(this.doc);
		const update = Y.encodeStateAsUpdate(this.doc);

		// Send as sync step 2
		syncProtocol.writeUpdate(encoder, update);
		this.broadcast(encoding.toUint8Array(encoder));

		// Also broadcast current awareness
		this.broadcastAwareness();
	}

	private handleSyncMessage(decoder: decoding.Decoder, senderId: string) {
		const encoder = encoding.createEncoder();

		// Apply the sync message - mark origin as 'remote' so we don't re-broadcast
		const syncMessageType = syncProtocol.readSyncMessage(
			decoder,
			encoder,
			this.doc,
			"remote" // Use 'remote' as origin to prevent re-broadcasting
		);

		// If we need to respond (sync step 2), send it back
		if (encoding.length(encoder) > 0) {
			const responseEncoder = encoding.createEncoder();
			encoding.writeVarUint(responseEncoder, MESSAGE_SYNC);
			encoding.writeVarUint8Array(
				responseEncoder,
				encoding.toUint8Array(encoder)
			);
			this.broadcast(encoding.toUint8Array(responseEncoder));
		}

		// Mark as synced after receiving sync step 2
		if (syncMessageType === syncProtocol.messageYjsSyncStep2 && !this.synced) {
			this.synced = true;
			if (this.syncTimeout) {
				clearTimeout(this.syncTimeout);
				this.syncTimeout = null;
			}
			this.onSyncCallbacks.forEach((cb) => cb());
		}
	}

	private handleAwarenessMessage(decoder: decoding.Decoder) {
		try {
			const update = decoding.readVarUint8Array(decoder);

			// Apply awareness update - this will NOT affect local cursor position
			// because we're only updating OTHER clients' states
			awarenessProtocol.applyAwarenessUpdate(this.awareness, update, this);

			// Notify awareness listeners
			const states = new Map<number, any>();
			this.awareness.getStates().forEach((state, clientId) => {
				states.set(clientId, state);
			});
			this.onAwarenessCallbacks.forEach((cb) => cb(states));
		} catch (e) {
			console.error("[SupabaseYjs] Error applying awareness update:", e);
		}
	}

	private broadcastAwareness() {
		if (this.isDestroyed) return;

		const encoder = encoding.createEncoder();
		encoding.writeVarUint(encoder, MESSAGE_AWARENESS);

		// Only encode our own awareness state
		const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(
			this.awareness,
			[this.doc.clientID]
		);

		encoding.writeVarUint8Array(encoder, awarenessUpdate);
		this.broadcast(encoding.toUint8Array(encoder));
	}

	private broadcast(data: Uint8Array) {
		if (this.isDestroyed) return;

		this.channel.send({
			type: "broadcast",
			event: "yjs-sync",
			payload: {
				senderId: this.userId,
				clientId: this.clientId,
				data: this.uint8ArrayToBase64(data),
			},
		});
	}

	// Utility: Convert Uint8Array to base64 for Supabase broadcast
	private uint8ArrayToBase64(bytes: Uint8Array): string {
		let binary = "";
		for (let i = 0; i < bytes.byteLength; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return btoa(binary);
	}

	// Utility: Convert base64 to Uint8Array
	private base64ToUint8Array(base64: string): Uint8Array {
		const binary = atob(base64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		return bytes;
	}

	// Event handlers
	onSync(callback: () => void) {
		this.onSyncCallbacks.push(callback);
		if (this.synced) {
			callback();
		}
	}

	onAwarenessChange(callback: (states: Map<number, any>) => void) {
		this.onAwarenessCallbacks.push(callback);
	}

	// Set local awareness state
	setLocalState(state: any) {
		this.awareness.setLocalState(state);
	}

	// Get all awareness states
	getStates(): Map<number, any> {
		return this.awareness.getStates();
	}

	// Disconnect and cleanup
	destroy() {
		this.isDestroyed = true;

		if (this.syncTimeout) {
			clearTimeout(this.syncTimeout);
		}

		// Remove observers
		if ((this as any)._updateHandler) {
			this.doc.off("update", (this as any)._updateHandler);
		}
		if ((this as any)._awarenessHandler) {
			this.awareness.off("update", (this as any)._awarenessHandler);
		}

		this.awareness.destroy();
		this.channel.unsubscribe();
	}
}

export default SupabaseYjsProvider;
