import { Trophy, Rocket } from "lucide-react";
import type { Notification } from "../types";

interface CompletedNotificationItemProps {
	notification: Notification;
	onViewSummary: (notification: Notification) => void;
}

export const CompletedNotificationItem = ({
	notification,
	onViewSummary,
}: CompletedNotificationItemProps) => {
	const isCollaboration = notification.sessionType === "collaboration";

	return (
		<div className="flex items-start gap-3">
			<div
				className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
					isCollaboration ? "bg-purple-500" : "bg-[#FFD93D]"
				}`}
			>
				{isCollaboration ? (
					<Rocket size={20} className="text-white" />
				) : (
					<Trophy size={20} className="text-gray-900" />
				)}
			</div>

			<div className="flex-1 min-w-0">
				<p className="text-white font-medium">
					{isCollaboration
						? "Collaboration Completed! 🎉"
						: "Match Completed! 🎉"}
				</p>
				<p className="text-sm text-gray-400 mt-1">
					Your {notification.sessionType} for{" "}
					<span className="text-white">
						{notification.session.problem?.title}
					</span>{" "}
					has finished. View the results now!
				</p>

				<div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
					<span
						className={`px-2 py-0.5 rounded-full text-white ${
							isCollaboration ? "bg-purple-600" : "bg-green-600"
						}`}
					>
						Completed
					</span>
				</div>

				<div className="mt-3">
					<button
						onClick={() => onViewSummary(notification)}
						className={`w-full px-3 py-1.5 text-sm rounded-md flex items-center justify-center gap-1 transition font-medium ${
							isCollaboration
								? "bg-purple-500 hover:bg-purple-600 text-white"
								: "bg-[#FFD93D] hover:bg-[#e5c435] text-gray-900"
						}`}
					>
						{isCollaboration ? <Rocket size={14} /> : <Trophy size={14} />}
						View Summary
					</button>
				</div>
			</div>
		</div>
	);
};
