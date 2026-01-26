import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
	const navigate = useNavigate();

	return (
		<header className="bg-white p-4 shadow-sm border-b border-gray-200">
			<div className="container mx-auto">
				<div className="flex items-center justify-between">
					<button
						onClick={() => navigate("/explore")}
						className="flex items-center text-sky-600 hover:text-sky-700 transition-colors"
					>
						<ArrowLeft size={18} className="mr-1" />
						Back to Explore
					</button>
					<h1 className="text-xl font-bold text-center flex-grow text-gray-900">
						Match Summary
					</h1>
					<div className="w-20"></div>
				</div>
			</div>
		</header>
	);
}
