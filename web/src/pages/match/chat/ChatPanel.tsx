import React, { type RefObject } from "react";
import { Send } from "lucide-react";

import type { ChatMessage } from "../hooks/useChatPanel";

interface ChatPanelProps {
	// Data
	messages: ChatMessage[];
	inputMessage: string;
	currentUserId: string;
	messagesEndRef: RefObject<HTMLDivElement>;

	// Actions
	onSendMessage: (e: React.FormEvent) => void;
	onInputChange: (value: string) => void;

	// UI
	isMobile?: boolean;
}

export const ChatPanel = ({
	messages,
	inputMessage,
	currentUserId,
	messagesEndRef,
	onSendMessage,
	onInputChange,
	isMobile = false,
}: ChatPanelProps) => {
	return (
		<div className="flex flex-col h-full bg-[#1a1a1a]">
			{/* Header */}
			<div className="flex items-center px-3 py-2 border-b border-gray-700">
				<h3
					className={`font-medium text-gray-200 ${isMobile ? "text-sm" : ""}`}
				>
					Team Chat
				</h3>
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
			<form onSubmit={onSendMessage} className="p-3 border-t border-gray-700">
				<div className="flex space-x-2">
					<input
						type="text"
						value={inputMessage}
						onChange={(e) => onInputChange(e.target.value)}
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
