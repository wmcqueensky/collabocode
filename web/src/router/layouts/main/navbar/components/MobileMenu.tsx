import { Link } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import type { ModalType } from "../types";

interface MobileMenuProps {
	user: User | null;
	showMobileMenu: boolean;
	onCloseMenu: () => void;
	onLogout: () => void;
	onOpenModal: (modal: ModalType) => void;
	isActive: (path: string) => boolean;
}

export const MobileMenu = ({
	user,
	showMobileMenu,
	onCloseMenu,
	onLogout,
	onOpenModal,
	isActive,
}: MobileMenuProps) => {
	if (!showMobileMenu) return null;

	return (
		<div className="md:hidden bg-white px-4 pt-2 pb-4 border-t border-gray-200">
			<nav className="space-y-1">
				{user ? (
					<>
						<Link
							to="/profile"
							onClick={onCloseMenu}
							className={`block w-full text-left py-2 ${
								isActive("/profile") ? "text-sky-600" : "text-gray-700"
							}`}
						>
							Your Profile
						</Link>
						<button
							className="block w-full text-left py-2 text-gray-700"
							onClick={onLogout}
						>
							Sign Out
						</button>
					</>
				) : (
					<>
						<button
							onClick={() => {
								onOpenModal("login");
								onCloseMenu();
							}}
							className="block w-full text-left py-2 text-gray-700"
						>
							Sign In
						</button>
						<button
							onClick={() => {
								onOpenModal("register");
								onCloseMenu();
							}}
							className="block w-full text-left py-2 text-sky-600"
						>
							Register
						</button>
					</>
				)}
			</nav>
		</div>
	);
};
