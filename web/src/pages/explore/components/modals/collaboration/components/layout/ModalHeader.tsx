import { X } from "lucide-react";

type ModalHeaderProps = {
	icon?: React.ReactNode;
	title?: React.ReactNode;
	onClose?: () => void;
};

const ModalHeader = ({ icon, title, onClose }: ModalHeaderProps) => {
	return (
		<div className="bg-[#2c2c2c] px-6 py-4 border-b border-gray-700 flex justify-between items-center">
			<h2 className="text-xl font-bold text-white flex items-center">
				{icon}
				{title}
			</h2>
			<button
				onClick={onClose}
				className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
			>
				<X size={20} />
			</button>
		</div>
	);
};

export default ModalHeader;
