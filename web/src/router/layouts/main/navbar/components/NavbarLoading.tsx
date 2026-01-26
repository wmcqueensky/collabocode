import { Loader2 } from "lucide-react";
import { LogoIcon } from "./LogoIcon";

interface NavbarLoadingProps {
	onLogoClick: () => void;
}

export const NavbarLoading = ({ onLogoClick }: NavbarLoadingProps) => {
	return (
		<header className="bg-white border-b border-gray-200 py-3 sticky top-0 z-50 shadow-sm">
			<div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
				<div className="flex items-center space-x-2">
					<button
						onClick={onLogoClick}
						className="flex items-center space-x-2 cursor-pointer"
					>
						<h1 className="text-2xl font-bold flex items-center">
							<LogoIcon />
							<span className="text-gray-900">Collabo</span>
							<span className="text-sky-600">Code</span>
						</h1>
					</button>
				</div>
				<div className="flex items-center space-x-4">
					<Loader2 size={24} className="text-gray-400 animate-spin" />
				</div>
			</div>
		</header>
	);
};
