const OurStory = () => {
	return (
		<section
			id="our-story"
			className="bg-gray-50 py-20 px-4 sm:px-6 relative overflow-hidden"
		>
			{/* Subtle gradient background accent */}
			<div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl" />
			<div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-100 rounded-full blur-3xl" />

			<div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
				<h2 className="text-3xl md:text-4xl font-bold text-gray-900">
					The Story Behind <span className="text-purple-600">&lt;</span>
					<span className="text-gray-900">Collabo</span>
					<span className="text-sky-600">Code</span>
					<span className="text-purple-600">&gt;</span>
				</h2>

				<div className="space-y-6 text-left">
					<p className="text-gray-700 leading-relaxed">
						Most coding platforms are built for solo problem-solving. But
						interviews, team projects, and real-world software development
						demand something more —{" "}
						<span className="text-sky-600">communication</span>,{" "}
						<span className="text-purple-600">collaboration</span>, and fast
						thinking under pressure.
					</p>

					<p className="text-gray-600 leading-relaxed">
						That gap became clear when I was prepping alone — grinding LeetCode,
						second-guessing myself, and realizing that even with a study
						partner, we weren't actually learning to work as a team.
					</p>

					<div
						className="bg-white rounded-xl p-6 border-l-4 border-gradient-to-b from-sky-600 to-purple-600 shadow-sm"
						style={{
							borderImage: "linear-gradient(to bottom, #0284c7, #9333ea) 1",
						}}
					>
						<p className="text-gray-700 italic">
							"Built with developers, interviewers, and learners in mind,
							CollaboCode is the home for collaborative coding — whether you're
							prepping for a LeetCode grind or building a real project
							together."
						</p>
					</div>
				</div>
			</div>
		</section>
	);
};

export default OurStory;
