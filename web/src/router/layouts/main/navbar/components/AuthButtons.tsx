import type { ModalType } from "../types";

interface AuthButtonsProps {
	onOpenModal: (modal: ModalType) => void;
}

export const AuthButtons = ({ onOpenModal }: AuthButtonsProps) => {
	return (
		<>
			<button
				onClick={() => onOpenModal("login")}
				className="hidden sm:block text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md text-sm"
			>
				Sign In
			</button>
			<button
				onClick={() => onOpenModal("register")}
				className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
			>
				Register
			</button>
		</>
	);
};
