const WhyCollaborate = () => {
	return (
		<section id="why-collaboration" className="bg-[#171717] py-20 px-4 sm:px-6">
			<div className="max-w-4xl mx-auto text-center space-y-8">
				{/* Gradient heading */}
				<h2 className="text-3xl md:text-4xl font-bold">
					<span className="text-white">Why </span>
					<span className="bg-gradient-to-r from-[#5bc6ca] to-[#a78bfa] bg-clip-text text-transparent">
						Collaborative
					</span>
					<span className="text-white"> Coding?</span>
				</h2>

				<p className="text-gray-300 text-lg leading-relaxed">
					Great software is rarely built alone. Collaboration brings clarity,
					faster problem-solving, and real-time learning. You explain your
					thought process, challenge assumptions, and reduce time spent stuck in
					bugs. It's like pair programming—but more powerful.
				</p>

				{/* Stats row with both colors */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
					<div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-700/50">
						<div className="text-4xl font-bold text-[#5bc6ca] mb-2">2x</div>
						<div className="text-gray-400 text-sm">
							More effective debugging with collaborative programmers
						</div>
					</div>
					<div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-700/50">
						<div className="text-4xl font-bold text-[#a78bfa] mb-2">60%</div>
						<div className="text-gray-400 text-sm">
							More likely to learn new techniques through pair coding
						</div>
					</div>
				</div>

				<p className="text-gray-500 text-sm">
					Whether you're interviewing, building products, or solving practice
					problems—teams outperform individuals.
				</p>
			</div>
		</section>
	);
};

export default WhyCollaborate;
