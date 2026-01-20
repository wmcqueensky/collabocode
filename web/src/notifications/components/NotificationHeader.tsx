import { X } from "lucide-react";

interface NotificationHeaderProps {
	onClose: () => void;
}

export const NotificationHeader = ({ onClose }: NotificationHeaderProps) => {
	return (
		<div className="p-4 border-b border-gray-700 flex justify-between items-center">
			<h3 className="font-semibold text-white">Notifications</h3>
			<button onClick={onClose} className="text-gray-400 hover:text-white">
				<X size={18} />
			</button>
		</div>
	);
};
