/**
 * Y-WebSocket Server for Real-time Collaboration
 *
 * This is a simple WebSocket server that handles Yjs document synchronization.
 * You can deploy this as a standalone Node.js server or integrate it with your backend.
 *
 * For production, consider:
 * 1. Using y-websocket with persistence (y-leveldb, y-redis, etc.)
 * 2. Deploying on a service like Railway, Fly.io, or your own VPS
 * 3. Adding authentication middleware
 *
 * Installation:
 * npm install y-websocket ws yjs
 *
 * Run:
 * node server/yjs-server.js
 */

const WebSocket = require("ws");
const http = require("http");
const { setupWSConnection } = require("y-websocket/bin/utils");

const PORT = process.env.YJS_PORT || 1234;
const HOST = process.env.YJS_HOST || "0.0.0.0";

// Create HTTP server
const server = http.createServer((request, response) => {
	response.writeHead(200, { "Content-Type": "text/plain" });
	response.end("Yjs WebSocket Server\n");
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on("connection", (ws, req) => {
	// Extract room name from URL path
	const url = new URL(req.url, `http://${req.headers.host}`);
	const roomName = url.pathname.slice(1) || "default";

	console.log(`[Yjs] New connection to room: ${roomName}`);

	// Set up Yjs WebSocket connection
	setupWSConnection(ws, req, {
		docName: roomName,
		gc: true, // Enable garbage collection
	});

	ws.on("close", () => {
		console.log(`[Yjs] Connection closed for room: ${roomName}`);
	});

	ws.on("error", (error) => {
		console.error(`[Yjs] WebSocket error in room ${roomName}:`, error);
	});
});

// Start server
server.listen(PORT, HOST, () => {
	console.log(`[Yjs] WebSocket server running at ws://${HOST}:${PORT}`);
	console.log(`[Yjs] Health check at http://${HOST}:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
	console.log("[Yjs] Shutting down...");
	wss.close(() => {
		server.close(() => {
			process.exit(0);
		});
	});
});
