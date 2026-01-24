import { Loader2 } from "lucide-react";
import { LogoIcon } from "./LogoIcon";

interface NavbarLoadingProps {
	onLogoClick: () => void;
}

export const NavbarLoading = ({ onLogoClick }: NavbarLoadingProps) => {
	return (
		<header className="bg-[#1a1a1a] border-b border-gray-800 py-3 sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
				<div className="flex items-center space-x-2">
					<button
						onClick={onLogoClick}
						className="flex items-center space-x-2 cursor-pointer"
					>
						<h1 className="text-2xl font-bold flex items-center">
							<LogoIcon />
							<span className="text-white">Collabo</span>
							<span className="text-[#5bc6ca]">Code</span>
						</h1>
					</button>
				</div>
				<div className="flex items-center space-x-4">
					<Loader2 size={24} className="text-gray-500 animate-spin" />
				</div>
			</div>
		</header>
	);
};
