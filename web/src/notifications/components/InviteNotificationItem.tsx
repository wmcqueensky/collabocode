import { Check, X, Clock, Users, Rocket } from "lucide-react";
import type { Notification } from "../types";

interface InviteNotificationItemProps {
	notification: Notification;
	onAccept: (notification: Notification) => void;
	onDecline: (notification: Notification) => void;
}

export const InviteNotificationItem = ({
	notification,
	onAccept,
	onDecline,
}: InviteNotificationItemProps) => {
	const isCollaboration = notification.sessionType === "collaboration";

	const getDifficultyColor = (difficulty: string | undefined) => {
		switch (difficulty) {
			case "Easy":
				return "bg-green-600";
			case "Medium":
				return "bg-yellow-600";
			case "Hard":
				return "bg-red-600";
			default:
				return "bg-gray-600";
		}
	};

	return (
		<div className="flex items-start gap-3">
			<div
				className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
					isCollaboration ? "bg-purple-500" : "bg-[#5bc6ca]"
				}`}
			>
				{isCollaboration ? (
					<Rocket size={20} className="text-white" />
				) : (
					<Users size={20} className="text-white" />
				)}
			</div>

			<div className="flex-1 min-w-0">
				<p className="text-white font-medium">
					{isCollaboration ? "Collaboration Invite" : "Coding Session Invite"}
				</p>
				<p className="text-sm text-gray-400 mt-1">
					<span
						className={isCollaboration ? "text-purple-400" : "text-[#5bc6ca]"}
					>
						@{notification.session.host?.username}
					</span>{" "}
					invited you to {isCollaboration ? "collaborate on" : "solve"}{" "}
					<span className="text-white">
						{notification.session.problem?.title}
					</span>
				</p>

				<div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
					<span className="flex items-center">
						<Clock size={12} className="mr-1" />
						{notification.session.time_limit} min
					</span>
					<span className="flex items-center">
						<Users size={12} className="mr-1" />
						{notification.session.max_players}{" "}
						{isCollaboration ? "collaborators" : "players"}
					</span>
					<span
						className={`px-2 py-0.5 rounded-full text-white ${getDifficultyColor(
							notification.session.problem?.difficulty,
						)}`}
					>
						{notification.session.problem?.difficulty}
					</span>
				</div>

				<div className="mt-3 flex gap-2">
					<button
						onClick={() => onAccept(notification)}
						className={`flex-1 px-3 py-1.5 text-white text-sm rounded-md flex items-center justify-center gap-1 transition ${
							isCollaboration
								? "bg-purple-500 hover:bg-purple-600"
								: "bg-[#5bc6ca] hover:bg-[#48aeb3]"
						}`}
					>
						<Check size={14} />
						Accept
					</button>
					<button
						onClick={() => onDecline(notification)}
						className="flex-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center justify-center gap-1 transition"
					>
						<X size={14} />
						Decline
					</button>
				</div>
			</div>
		</div>
	);
};
