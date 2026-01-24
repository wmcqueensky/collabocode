import type { ModalType } from "../types";

interface AuthButtonsProps {
	onOpenModal: (modal: ModalType) => void;
}

export const AuthButtons = ({ onOpenModal }: AuthButtonsProps) => {
	return (
		<>
			<button
				onClick={() => onOpenModal("login")}
				className="hidden sm:block text-gray-300 hover:text-white px-3 py-1 rounded-md text-sm"
			>
				Sign In
			</button>
			<button
				onClick={() => onOpenModal("register")}
				className="bg-[#5bc6ca] hover:bg-[#48aeb3] text-white px-3 py-1 rounded-md text-sm transition-colors"
			>
				Register
			</button>
		</>
	);
};
