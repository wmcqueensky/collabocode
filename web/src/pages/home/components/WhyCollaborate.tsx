const WhyCollaborate = () => {
	return (
		<section id="why-collaboration" className="bg-white py-20 px-4 sm:px-6">
			<div className="max-w-4xl mx-auto text-center space-y-8">
				{/* Gradient heading */}
				<h2 className="text-3xl md:text-4xl font-bold">
					<span className="text-gray-900">Why </span>
					<span className="bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">
						Collaborative
					</span>
					<span className="text-gray-900"> Coding?</span>
				</h2>

				<p className="text-gray-700 text-lg leading-relaxed">
					Great software is rarely built alone. Collaboration brings clarity,
					faster problem-solving, and real-time learning. You explain your
					thought process, challenge assumptions, and reduce time spent stuck in
					bugs. It's like pair programming—but more powerful.
				</p>

				{/* Stats row with both colors */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
					<div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
						<div className="text-4xl font-bold text-sky-600 mb-2">2x</div>
						<div className="text-gray-600 text-sm">
							More effective debugging with collaborative programmers
						</div>
					</div>
					<div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
						<div className="text-4xl font-bold text-purple-600 mb-2">60%</div>
						<div className="text-gray-600 text-sm">
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
