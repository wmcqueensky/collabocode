import { ArrowLeft, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
	const navigate = useNavigate();

	return (
		<header className="bg-white border-b border-gray-200 p-4 shadow-sm">
			<div className="container mx-auto">
				<div className="flex items-center justify-between">
					<button
						onClick={() => navigate("/explore")}
						className="flex items-center text-purple-600 hover:text-purple-700 transition-colors"
					>
						<ArrowLeft size={18} className="mr-1" />
						Back to Explore
					</button>
					<h1 className="text-xl font-bold text-gray-900 text-center flex-grow flex items-center justify-center">
						<Rocket className="mr-2 text-purple-500" size={24} />
						Team Collaboration Summary
					</h1>
					<div className="w-20"></div>
				</div>
			</div>
		</header>
	);
}
