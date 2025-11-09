import React, { useState, useEffect, useRef } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { supabase } from "../../../lib/supabase";

type Message = {
	id: string;
	user_id: string;
	username: string;
	message: string;
	timestamp: string;
};

type ChatPanelProps = {
	isMicOn: boolean;
	setIsMicOn: (on: boolean) => void;
	isMobile?: boolean;
	sessionId?: string;
};

export const ChatPanel = ({
	isMicOn,
	setIsMicOn,
	isMobile = false,
	sessionId,
}: ChatPanelProps) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputMessage, setInputMessage] = useState("");
	const [currentUserId, setCurrentUserId] = useState<string>("");
	const [currentUsername, setCurrentUsername] = useState<string>("");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Load current user
	useEffect(() => {
		const loadUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				setCurrentUserId(user.id);
				setCurrentUsername(
					user.user_metadata?.username || user.email?.split("@")[0] || "User"
				);
			}
		};
		loadUser();
	}, []);

	// Subscribe to messages
	useEffect(() => {
		if (!sessionId) return;

		// Subscribe to broadcast channel for messages
		const channel = supabase.channel(`chat:${sessionId}`);

		channel
			.on("broadcast", { event: "message" }, (payload: any) => {
				console.log("New message:", payload);
				// Add message from broadcast (including echoed back messages)
				setMessages((prev) => {
					// Check if message already exists to prevent duplicates
					const exists = prev.some((msg) => msg.id === payload.payload.id);
					if (exists) return prev;
					return [...prev, payload.payload];
				});
				scrollToBottom();
			})
			.subscribe();

		return () => {
			channel.unsubscribe();
		};
	}, [sessionId]);

	// Auto-scroll to bottom
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// Send message
	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!inputMessage.trim() || !sessionId) return;

		const message: Message = {
			id: `${Date.now()}-${currentUserId}`,
			user_id: currentUserId,
			username: currentUsername,
			message: inputMessage.trim(),
			timestamp: new Date().toISOString(),
		};

		// Add message to local state immediately
		setMessages((prev) => [...prev, message]);
		setInputMessage("");
		scrollToBottom();

		// Broadcast message to others
		try {
			const channel = supabase.channel(`chat:${sessionId}`);
			await channel.send({
				type: "broadcast",
				event: "message",
				payload: message,
			});
		} catch (error) {
			console.error("Error sending message:", error);
		}
	};

	// Toggle mic
	const toggleMic = () => {
		setIsMicOn(!isMicOn);
		// TODO: Implement actual voice chat functionality
	};

	return (
		<div className="flex flex-col h-full bg-[#1a1a1a]">
			{/* Header */}
			<div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
				<h3
					className={`font-medium text-gray-200 ${isMobile ? "text-sm" : ""}`}
				>
					Team Chat
				</h3>
				<button
					onClick={toggleMic}
					className={`p-1.5 rounded-md transition ${
						isMicOn
							? "bg-[#5bc6ca] text-black"
							: "bg-gray-700 text-gray-300 hover:bg-gray-600"
					}`}
					title={isMicOn ? "Mute microphone" : "Unmute microphone"}
				>
					{isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
				</button>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto p-3 space-y-2">
				{messages.length === 0 ? (
					<div className="flex items-center justify-center h-full text-gray-500 text-sm">
						No messages yet. Say hi! 👋
					</div>
				) : (
					messages.map((msg) => {
						const isCurrentUser = msg.user_id === currentUserId;
						const time = new Date(msg.timestamp).toLocaleTimeString("en-US", {
							hour: "2-digit",
							minute: "2-digit",
						});

						return (
							<div
								key={msg.id}
								className={`flex ${
									isCurrentUser ? "justify-end" : "justify-start"
								}`}
							>
								<div
									className={`max-w-[75%] rounded-lg px-3 py-2 ${
										isCurrentUser
											? "bg-[#5bc6ca] text-black"
											: "bg-gray-700 text-gray-200"
									}`}
								>
									{!isCurrentUser && (
										<div className="text-xs font-medium mb-1 opacity-75">
											{msg.username}
										</div>
									)}
									<div className={isMobile ? "text-xs" : "text-sm"}>
										{msg.message}
									</div>
									<div
										className={`text-[10px] mt-1 ${
											isCurrentUser ? "text-black/60" : "text-gray-400"
										}`}
									>
										{time}
									</div>
								</div>
							</div>
						);
					})
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input */}
			<form
				onSubmit={handleSendMessage}
				className="p-3 border-t border-gray-700"
			>
				<div className="flex space-x-2">
					<input
						type="text"
						value={inputMessage}
						onChange={(e) => setInputMessage(e.target.value)}
						placeholder="Type a message..."
						className={`flex-1 bg-gray-700 text-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#5bc6ca] ${
							isMobile ? "text-sm" : ""
						}`}
					/>
					<button
						type="submit"
						disabled={!inputMessage.trim()}
						className="bg-[#5bc6ca] hover:bg-[#48aeb3] text-black p-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Send size={16} />
					</button>
				</div>
			</form>
		</div>
	);
};
