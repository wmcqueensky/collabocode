import { X } from "lucide-react";

interface NotificationHeaderProps {
	onClose: () => void;
}

export const NotificationHeader = ({ onClose }: NotificationHeaderProps) => {
	return (
		<div className="p-4 border-b border-gray-200 flex justify-between items-center">
			<h3 className="font-semibold text-gray-900">Notifications</h3>
			<button onClick={onClose} className="text-gray-400 hover:text-gray-600">
				<X size={18} />
			</button>
		</div>
	);
};
