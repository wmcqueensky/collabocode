import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ErrorStateProps {
	error: string;
}

export default function ErrorState({ error }: ErrorStateProps) {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-[#171717] flex items-center justify-center">
			<div className="max-w-md mx-auto text-center p-8">
				<AlertTriangle className="text-yellow-500 mx-auto mb-4" size={64} />
				<h1 className="text-2xl font-bold text-white mb-4">
					Match Summary Not Available
				</h1>
				<p className="text-gray-400 mb-6">{error}</p>
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
