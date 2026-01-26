import { Bell } from "lucide-react";

interface BellButtonProps {
	unreadCount: number;
	onClick: () => void;
}

export const BellButton = ({ unreadCount, onClick }: BellButtonProps) => {
	return (
		<button
			onClick={onClick}
			className="relative p-2 rounded-full hover:bg-gray-100 transition"
		>
			<Bell size={20} className="text-gray-600" />
			{unreadCount > 0 && (
				<span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
					{unreadCount}
				</span>
			)}
		</button>
	);
};
