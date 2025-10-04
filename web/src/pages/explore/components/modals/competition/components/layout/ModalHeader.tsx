import { X } from "lucide-react";

type ModalHeaderProps = {
	icon?: React.ReactNode;
	title?: React.ReactNode;
	onClose?: () => void;
};

const ModalHeader = ({ icon, title, onClose }: ModalHeaderProps) => {
	return (
		<div className="flex items-center justify-between p-4 border-b border-gray-700">
			<div className="flex items-center">
				{icon}
				<h2 className="text-lg font-medium text-white ml-3">{title}</h2>
			</div>
			<button
				type="button"
				onClick={onClose}
				className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#3a3a3a] transition"
				aria-label="Close"
			>
				<X size={18} />
			</button>
		</div>
	);
};

export default ModalHeader;
