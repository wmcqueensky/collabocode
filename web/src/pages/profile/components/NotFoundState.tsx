import { Link } from "react-router-dom";

const NotFoundState = () => {
	return (
		<div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
			<div className="text-center">
				<p className="text-gray-400 mb-4">Profile not found</p>
				<Link
					to="/"
					className="px-4 py-2 bg-[#5bc6ca] hover:bg-[#48aeb3] text-white rounded-lg transition-colors"
				>
					Go Home
				</Link>
			</div>
		</div>
	);
};

export default NotFoundState;
