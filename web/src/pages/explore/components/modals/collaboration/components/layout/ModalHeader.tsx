import { X } from "lucide-react";

import type { ModalHeaderProps } from "../../types";

const ModalHeader = ({ icon, title, onClose }: ModalHeaderProps) => {
	return (
		<div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center rounded-t-xl">
			<h2 className="text-xl font-bold text-gray-900 flex items-center">
				{icon}
				{title}
			</h2>
			<button
				onClick={onClose}
				className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors"
			>
				<X size={20} />
			</button>
		</div>
	);
};

export default ModalHeader;
