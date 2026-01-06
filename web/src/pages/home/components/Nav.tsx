const Nav = () => {
	const scrollToSection = (e: React.MouseEvent<HTMLElement>, id: string) => {
		e.preventDefault();
		const element = document.getElementById(id);
		if (element) element.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<nav className="sticky top-0 z-20 bg-[#171717]/95 backdrop-blur-sm border-b border-gray-700/50 shadow-sm text-sm">
			<ul className="flex flex-wrap justify-center space-x-4 sm:space-x-6 py-3">
				<li>
					<a
						href="#why-collaboration"
						onClick={(e) => scrollToSection(e, "why-collaboration")}
						className="text-gray-300 hover:text-[#a78bfa] transition-colors"
					>
						Why Collaborate
					</a>
				</li>
				<li>
					<a
						href="#our-story"
						onClick={(e) => scrollToSection(e, "our-story")}
						className="text-gray-300 hover:text-[#a78bfa] transition-colors"
					>
						Our Story
					</a>
				</li>
				<li>
					<a
						href="#how-it-works"
						onClick={(e) => scrollToSection(e, "how-it-works")}
						className="text-gray-300 hover:text-[#5bc6ca] transition-colors"
					>
						Modes
					</a>
				</li>
				<li>
					<a
						href="#features"
						onClick={(e) => scrollToSection(e, "features")}
						className="text-gray-300 hover:text-[#5bc6ca] transition-colors"
					>
						Features
					</a>
				</li>
				<li>
					<a
						href="/explore"
						className="bg-gradient-to-r from-[#5bc6ca] to-[#8b5cf6] bg-clip-text text-transparent font-semibold hover:opacity-80 transition-opacity"
					>
						Get Started →
					</a>
				</li>
			</ul>
		</nav>
	);
};

export default Nav;
