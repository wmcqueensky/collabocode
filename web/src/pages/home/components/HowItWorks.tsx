const HowItWorks = () => {
	return (
		<section id="how-it-works" className="bg-[#171717] py-16 px-4 sm:px-6">
			<div className="max-w-5xl mx-auto space-y-10 text-center">
				<h2 className="text-3xl md:text-4xl font-bold text-white">
					How It Works
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12 text-left">
					<div>
						<h3 className="text-xl sm:text-2xl font-semibold text-[#5bc6ca] mb-3">
							🔍 LeetCode Mode
						</h3>
						<p className="text-gray-400">
							Join your group, solve curated problems together, race against a
							timer, and compare solutions afterward. Great for interview prep,
							teaching, and daily practice.
						</p>
					</div>
					<div>
						<h3 className="text-xl sm:text-2xl font-semibold text-[#5bc6ca] mb-3">
							🛠 Codebase Mode
						</h3>
						<p className="text-gray-400">
							Collaborate on full-stack applications, toy projects, or hackathon
							ideas. Shared file tree, versioning, and live cursors give you the
							feeling of working side-by-side.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HowItWorks;
