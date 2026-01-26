import { X } from "lucide-react";
import type { ModalHeaderProps } from "../../types";

const ModalHeader = ({ icon, title, onClose }: ModalHeaderProps) => {
	return (
		<div className="flex items-center justify-between p-4 border-b border-gray-200">
			<div className="flex items-center">
				{icon}
				<h2 className="text-lg font-medium text-gray-900 ml-3">{title}</h2>
			</div>
			<button
				type="button"
				onClick={onClose}
				className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition"
				aria-label="Close"
			>
				<X size={18} />
			</button>
		</div>
	);
};

export default ModalHeader;
