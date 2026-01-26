import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFoundState() {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center">
			<div className="text-center">
				<AlertTriangle className="text-red-500 mx-auto mb-4" size={64} />
				<div className="text-gray-900 text-xl mb-4">Summary not found</div>
				<button
					onClick={() => navigate("/explore")}
					className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition"
				>
					Back to Explore
				</button>
			</div>
		</div>
	);
}
