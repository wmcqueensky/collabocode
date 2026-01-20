import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
	const navigate = useNavigate();

	return (
		<header className="bg-[#2c2c2c] p-4 shadow-md">
			<div className="container mx-auto">
				<div className="flex items-center justify-between">
					<button
						onClick={() => navigate("/explore")}
						className="flex items-center text-[#5bc6ca] hover:text-[#48aeb3] transition-colors"
					>
						<ArrowLeft size={18} className="mr-1" />
						Back to Explore
					</button>
					<h1 className="text-xl font-bold text-center flex-grow">
						Match Summary
					</h1>
					<div className="w-20"></div>
				</div>
			</div>
		</header>
	);
}
