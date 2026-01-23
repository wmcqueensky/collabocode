import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabase";
import type { ChatMessage } from "../types";

interface UseChatPanelProps {
	sessionId?: string;
}

export function useChatPanel({ sessionId }: UseChatPanelProps) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
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
					user.user_metadata?.username || user.email?.split("@")[0] || "User",
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
					const newMessage = payload.new as ChatMessage;

					setMessages((prev) => {
						// Avoid duplicates
						if (prev.some((msg) => msg.id === newMessage.id)) {
							return prev;
						}
						return [...prev, newMessage];
					});
					scrollToBottom();
				},
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

	// Update input message
	const updateInputMessage = (value: string) => {
		setInputMessage(value);
	};

	return {
		messages,
		inputMessage,
		currentUserId,
		messagesEndRef,
		handleSendMessage,
		updateInputMessage,
	};
}
