import React from "react";

const FinalCTA: React.FC = () => {
	return (
		<section className="bg-[#171717] py-20 text-center px-4 sm:px-6">
			<h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6">
				Ready to build better code together?
			</h2>
			<a href="/dashboard">
				<button className="px-6 py-3 bg-[#5bc6ca] text-black font-semibold rounded-xl hover:bg-[#48aeb3] transition">
					Collaborate Now →
				</button>
			</a>
		</section>
	);
};

export default FinalCTA;
