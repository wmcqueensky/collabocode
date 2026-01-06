const FinalCTA = () => {
	return (
		<section className="bg-[#171717] py-24 px-4 sm:px-6 relative overflow-hidden">
			{/* Background gradient accents */}
			<div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#5bc6ca]/10 rounded-full blur-3xl -translate-y-1/2" />
			<div className="absolute top-1/2 right-1/4 w-64 h-64 bg-[#8b5cf6]/10 rounded-full blur-3xl -translate-y-1/2" />

			<div className="max-w-3xl mx-auto text-center relative z-10">
				<h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
					Ready to build better code{" "}
					<span className="bg-gradient-to-r from-[#5bc6ca] to-[#a78bfa] bg-clip-text text-transparent">
						together
					</span>
					?
				</h2>
				<p className="text-gray-400 mb-8 max-w-xl mx-auto">
					Join thousands of developers who are leveling up their skills through
					collaborative coding.
				</p>

				<div className="flex flex-wrap justify-center gap-4">
					{/* Primary gradient button */}
					<a href="/explore">
						<button className="px-8 py-4 bg-gradient-to-r from-[#5bc6ca] to-[#8b5cf6] text-white font-semibold rounded-xl hover:opacity-90 transition shadow-lg shadow-[#5bc6ca]/20">
							Start Coding Together →
						</button>
					</a>
				</div>

				{/* Trust indicators */}
				<div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
					<div className="flex items-center gap-2">
						<span className="w-2 h-2 rounded-full bg-green-500" />
						No credit card required
					</div>
					<div className="flex items-center gap-2">
						<span className="w-2 h-2 rounded-full bg-green-500" />
						Free to get started
					</div>
					<div className="flex items-center gap-2">
						<span className="w-2 h-2 rounded-full bg-green-500" />
						Instant collaboration
					</div>
				</div>
			</div>
		</section>
	);
};

export default FinalCTA;
