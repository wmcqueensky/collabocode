const OurStory = () => {
	return (
		<section
			id="our-story"
			className="bg-[#1f1f1f] py-20 px-4 sm:px-6 relative overflow-hidden"
		>
			{/* Subtle gradient background accent */}
			<div className="absolute top-0 right-0 w-96 h-96 bg-[#8b5cf6]/5 rounded-full blur-3xl" />
			<div className="absolute bottom-0 left-0 w-96 h-96 bg-[#5bc6ca]/5 rounded-full blur-3xl" />

			<div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
				<h2 className="text-3xl md:text-4xl font-bold text-white">
					The Story Behind <span className="text-[#a78bfa]">&lt;</span>
					<span className="text-white">Collabo</span>
					<span className="text-[#5bc6ca]">Code</span>
					<span className="text-[#a78bfa]">&gt;</span>
				</h2>

				<div className="space-y-6 text-left">
					<p className="text-gray-300 leading-relaxed">
						Most coding platforms are built for solo problem-solving. But
						interviews, team projects, and real-world software development
						demand something more —{" "}
						<span className="text-[#5bc6ca]">communication</span>,{" "}
						<span className="text-[#a78bfa]">collaboration</span>, and fast
						thinking under pressure.
					</p>

					<p className="text-gray-400 leading-relaxed">
						That gap became clear when I was prepping alone — grinding LeetCode,
						second-guessing myself, and realizing that even with a study
						partner, we weren't actually learning to work as a team.
					</p>

					<div
						className="bg-[#252525] rounded-xl p-6 border-l-4 border-gradient-to-b from-[#5bc6ca] to-[#8b5cf6]"
						style={{
							borderImage: "linear-gradient(to bottom, #5bc6ca, #8b5cf6) 1",
						}}
					>
						<p className="text-gray-300 italic">
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
