import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFoundState() {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-[#171717] flex items-center justify-center">
			<div className="text-center">
				<AlertTriangle className="text-red-500 mx-auto mb-4" size={64} />
				<div className="text-white text-xl mb-4">Match summary not found</div>
				<button
					onClick={() => navigate("/explore")}
					className="bg-[#5bc6ca] hover:bg-[#48aeb3] text-white px-6 py-3 rounded-lg font-medium transition"
				>
					Back to Explore
				</button>
			</div>
		</div>
	);
}
