import { Code, Rocket } from "lucide-react";

const HowItWorks = () => {
	return (
		<section id="how-it-works" className="bg-white py-20 px-4 sm:px-6">
			<div className="max-w-5xl mx-auto space-y-12">
				<div className="text-center">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
						Two Modes, One Platform
					</h2>
					<p className="text-gray-600 max-w-2xl mx-auto">
						Choose how you want to code together. Each mode is optimized for
						different goals.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Duel Mode - Sky */}
					<div className="group relative bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:border-sky-300 transition-all duration-300">
						{/* Glow effect on hover */}
						<div className="absolute inset-0 bg-sky-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

						<div className="relative z-10">
							<div className="w-14 h-14 rounded-xl bg-sky-100 flex items-center justify-center mb-6">
								<Code size={28} className="text-sky-600" />
							</div>

							<h3 className="text-2xl font-bold text-sky-600 mb-4">
								Duel Mode
							</h3>

							<p className="text-gray-600 mb-6 leading-relaxed">
								Compete head-to-head against other developers by solving Data
								Structures and Algorithms problems. Race against the clock and
								prove your skills in real-time competitive coding battles.
							</p>

							<ul className="space-y-3 text-sm text-gray-700">
								<li className="flex items-center">
									<span className="w-1.5 h-1.5 rounded-full bg-sky-600 mr-3" />
									Head-to-head competition
								</li>
								<li className="flex items-center">
									<span className="w-1.5 h-1.5 rounded-full bg-sky-600 mr-3" />
									DSA problem challenges
								</li>
								<li className="flex items-center">
									<span className="w-1.5 h-1.5 rounded-full bg-sky-600 mr-3" />
									Rating & leaderboards
								</li>
								<li className="flex items-center">
									<span className="w-1.5 h-1.5 rounded-full bg-sky-600 mr-3" />
									Post-match analysis
								</li>
							</ul>

							<a href="/explore" className="inline-block mt-6">
								<button className="px-5 py-2.5 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition">
									Start Duel →
								</button>
							</a>
						</div>
					</div>

					{/* Collabo Mode - Purple */}
					<div className="group relative bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:border-purple-300 transition-all duration-300">
						{/* Glow effect on hover */}
						<div className="absolute inset-0 bg-purple-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

						<div className="relative z-10">
							<div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-6">
								<Rocket size={28} className="text-purple-600" />
							</div>

							<h3 className="text-2xl font-bold text-purple-600 mb-4">
								Collabo Mode
							</h3>

							<p className="text-gray-600 mb-6 leading-relaxed">
								Work together with your team in real time to solve a shared DSA
								problem. Collaborate on solutions, share ideas, and learn from
								each other as you code side-by-side.
							</p>

							<ul className="space-y-3 text-sm text-gray-700">
								<li className="flex items-center">
									<span className="w-1.5 h-1.5 rounded-full bg-purple-600 mr-3" />
									Real-time collaboration
								</li>
								<li className="flex items-center">
									<span className="w-1.5 h-1.5 rounded-full bg-purple-600 mr-3" />
									Shared DSA problem solving
								</li>
								<li className="flex items-center">
									<span className="w-1.5 h-1.5 rounded-full bg-purple-600 mr-3" />
									Live cursors & chat
								</li>
								<li className="flex items-center">
									<span className="w-1.5 h-1.5 rounded-full bg-purple-600 mr-3" />
									Team learning experience
								</li>
							</ul>

							<a href="/explore" className="inline-block mt-6">
								<button className="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition">
									Start Collabo →
								</button>
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HowItWorks;
