const LoadingState = () => {
	return (
		<div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
			<div className="text-center">
				<div className="w-16 h-16 border-4 border-[#5bc6ca] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
				<p className="text-gray-400">Loading profile...</p>
			</div>
		</div>
	);
};

export default LoadingState;
