import React, { useState, useEffect, useRef } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { supabase } from "../../../lib/supabase";

type Message = {
	id: string;
	user_id: string;
	session_id: string;
	username: string;
	message: string;
	created_at: string;
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

	// Load existing messages from database
	useEffect(() => {
		if (!sessionId) return;

		const loadMessages = async () => {
			const { data, error } = await supabase
				.from("chat_messages")
				.select("*")
				.eq("session_id", sessionId)
				.order("created_at", { ascending: true });

			if (error) {
				console.error("Error loading messages:", error);
			} else if (data) {
				setMessages(data);
				scrollToBottom();
			}
		};

		loadMessages();
	}, [sessionId]);

	// Subscribe to new messages
	useEffect(() => {
		if (!sessionId) return;

		const channel = supabase
			.channel(`chat:${sessionId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "chat_messages",
					filter: `session_id=eq.${sessionId}`,
				},
				(payload) => {
					console.log("New message:", payload);
					const newMessage = payload.new as Message;

					setMessages((prev) => {
						// Avoid duplicates
						if (prev.some((msg) => msg.id === newMessage.id)) {
							return prev;
						}
						return [...prev, newMessage];
					});
					scrollToBottom();
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [sessionId]);

	// Auto-scroll to bottom
	const scrollToBottom = () => {
		setTimeout(() => {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}, 100);
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// Send message
	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!inputMessage.trim() || !sessionId) return;

		try {
			const { error } = await supabase.from("chat_messages").insert({
				session_id: sessionId,
				user_id: currentUserId,
				username: currentUsername,
				message: inputMessage.trim(),
			});

			if (error) {
				console.error("Error sending message:", error);
			} else {
				setInputMessage("");
			}
		} catch (error) {
			console.error("Error sending message:", error);
		}
	};

	// Toggle mic
	const toggleMic = () => {
		setIsMicOn(!isMicOn);
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
						const time = new Date(msg.created_at).toLocaleTimeString("en-US", {
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
