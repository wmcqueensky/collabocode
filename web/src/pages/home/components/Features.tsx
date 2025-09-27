import React from "react";

const Features: React.FC = () => {
	return (
		<section id="features" className="bg-[#2c2c2c] py-16 px-4 sm:px-6">
			<div className="max-w-5xl mx-auto space-y-12 text-center">
				<h2 className="text-3xl md:text-4xl font-bold text-white">
					What You Get
				</h2>
				<ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-300 text-base sm:text-lg">
					<li className="flex items-center justify-center">
						<span className="inline-block text-left w-95">
							🧠 Real-time shared editor
						</span>
					</li>
					<li className="flex items-center justify-center">
						<span className="inline-block text-left w-95">
							🎯 Built-in timer and scoring
						</span>
					</li>
					<li className="flex items-center justify-center">
						<span className="inline-block text-left w-95">
							📜 Live chat, feedback, and typing insights
						</span>
					</li>
					<li className="flex items-center justify-center">
						<span className="inline-block text-left w-95">
							🧩 Problem sets + real-world repo support
						</span>
					</li>
					<li className="flex items-center justify-center">
						<span className="inline-block text-left w-95">
							📈 Post-match analysis and performance charts
						</span>
					</li>
					<li className="flex items-center justify-center">
						<span className="inline-block text-left w-95">
							🔒 No logins needed — just share the link
						</span>
					</li>
				</ul>
			</div>
		</section>
	);
};

export default Features;
