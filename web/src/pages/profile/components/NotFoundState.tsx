import { Link } from "react-router-dom";

const NotFoundState = () => {
	return (
		<div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
			<div className="text-center">
				<p className="text-gray-600 mb-4">Profile not found</p>
				<Link
					to="/"
					className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
				>
					Go Home
				</Link>
			</div>
		</div>
	);
};

export default NotFoundState;
