import React, { useEffect, useState } from "react";

const slogans = [
	"Code is better with company.",
	"From Solo to Synergy.",
	"Code better, together.",
	"Collaboration, compiled.",
	"From solo to squad.",
];

const HomePage: React.FC = () => {
	const [text, setText] = useState("");
	const [index, setIndex] = useState(0);
	const [charIndex, setCharIndex] = useState(0);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		const current = slogans[index];
		const speed = isDeleting ? 40 : 100;

		const timeout = setTimeout(() => {
			setText(
				isDeleting
					? current.substring(0, charIndex - 1)
					: current.substring(0, charIndex + 1)
			);
			setCharIndex(isDeleting ? charIndex - 1 : charIndex + 1);

			if (!isDeleting && charIndex === current.length) {
				setTimeout(() => setIsDeleting(true), 1000);
			} else if (isDeleting && charIndex === 0) {
				setIsDeleting(false);
				setIndex((prev) => (prev + 1) % slogans.length);
			}
		}, speed);

		return () => clearTimeout(timeout);
	}, [charIndex, isDeleting, index]);

	const scrollToSection = (e: React.MouseEvent<HTMLElement>, id: string) => {
		e.preventDefault();
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: "smooth" });
		}
	};

	return (
		<main className="text-gray-200">
			{/* Hero section */}
			<section
				id="hero"
				className="relative min-h-screen w-full overflow-hidden"
			>
				<video
					autoPlay
					loop
					muted
					className="absolute inset-0 w-full h-full object-cover"
					src="/coding.mp4"
				/>
				<div className="absolute inset-0 bg-black/70" />
				<div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
					<div className="flex items-center space-x-3 mb-4">
						<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold flex items-center flex-wrap justify-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="w-10 h-10 md:w-14 md:h-14 text-white"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M9.75 6.75L5.25 12l4.5 5.25M14.25 6.75L18.75 12l-4.5 5.25"
								/>
							</svg>
							<span className="text-white ml-2">Collabo</span>
							<span className="text-[#5bc6ca]">Code</span>
						</h1>
					</div>
					<p className="text-xl sm:text-2xl md:text-3xl font-mono text-[#5bc6ca] h-10">
						{text}
					</p>
					<div className="flex flex-wrap justify-center gap-4 py-4 mt-8">
						<a href="/explore">
							<button className="px-6 py-3 bg-[#5bc6ca] text-black font-semibold rounded-xl hover:bg-[#48aeb3] transition">
								Collaborate Now →
							</button>
						</a>
						<button
							onClick={(e) => scrollToSection(e, "why-collaboration")}
							className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-[#48aeb3] transition"
						>
							Learn Why →
						</button>
					</div>
				</div>
			</section>

			{/* Navigation */}
			<nav className="sticky top-0 z-20 bg-[#171717] border-b border-gray-700 shadow-sm text-sm">
				<ul className="flex flex-wrap justify-center space-x-4 sm:space-x-6 py-3">
					<li>
						<a
							href="#why-collaboration"
							onClick={(e) => scrollToSection(e, "why-collaboration")}
							className="hover:text-[#5bc6ca]"
						>
							Why Collaborate
						</a>
					</li>
					<li>
						<a
							href="#our-story"
							onClick={(e) => scrollToSection(e, "our-story")}
							className="hover:text-[#5bc6ca]"
						>
							Our Story
						</a>
					</li>
					<li>
						<a
							href="#how-it-works"
							onClick={(e) => scrollToSection(e, "how-it-works")}
							className="hover:text-[#5bc6ca]"
						>
							Modes
						</a>
					</li>
					<li>
						<a
							href="#features"
							onClick={(e) => scrollToSection(e, "features")}
							className="hover:text-[#5bc6ca]"
						>
							Features
						</a>
					</li>
					<li>
						<a href="/explore" className="text-[#5bc6ca] font-semibold">
							Collaborate →
						</a>
					</li>
				</ul>
			</nav>

			{/* Why Collaborate */}
			<section
				id="why-collaboration"
				className="bg-[#171717] py-16 px-4 sm:px-6"
			>
				<div className="max-w-4xl mx-auto text-center space-y-6">
					<h2 className="text-3xl md:text-4xl font-bold text-white">
						Why Collaborative Coding?
					</h2>
					<p className="text-gray-400 text-lg">
						Great software is rarely built alone. Collaboration brings clarity,
						faster problem-solving, and real-time learning. You explain your
						thought process, challenge assumptions, and reduce time spent stuck
						in bugs. It's like pair programming—but more powerful.
					</p>
					<p className="text-gray-500">
						Studies show collaborative programmers are 2x more effective in
						debugging and 60% more likely to learn new techniques. Whether
						you're interviewing, building products, or solving practice
						problems—teams outperform individuals.
					</p>
				</div>
			</section>

			{/* Our Story */}
			<section id="our-story" className="bg-[#2c2c2c] py-16 px-4 sm:px-6">
				<div className="max-w-4xl mx-auto text-center space-y-6">
					<h2 className="text-3xl md:text-4xl font-bold text-white">
						The Story Behind CollaboCode
					</h2>
					<p className="text-gray-400">
						Most coding platforms are built for solo problem-solving. But
						interviews, team projects, and real-world software development
						demand something more — communication, collaboration, and fast
						thinking under pressure. That gap became clear when I was prepping
						alone — grinding LeetCode, second-guessing myself, and realizing
						that even with a study partner, we weren’t actually learning to work
						as a team.
					</p>
					<p className="text-gray-500">
						Built with developers, interviewers, and learners in mind,
						CollaboCode is the home for collaborative coding — whether you're
						prepping for a LeetCode grind or building a real project together.
					</p>
				</div>
			</section>

			{/* How It Works */}
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
								timer, and compare solutions afterward. Great for interview
								prep, teaching, and daily practice.
							</p>
						</div>
						<div>
							<h3 className="text-xl sm:text-2xl font-semibold text-[#5bc6ca] mb-3">
								🛠 Codebase Mode
							</h3>
							<p className="text-gray-400">
								Collaborate on full-stack applications, toy projects, or
								hackathon ideas. Shared file tree, versioning, and live cursors
								give you the feeling of working side-by-side.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Features */}
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

			{/* Final CTA */}
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
		</main>
	);
};

export default HomePage;
