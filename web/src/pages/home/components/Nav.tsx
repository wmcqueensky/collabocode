const Nav = () => {
	const scrollToSection = (e: React.MouseEvent<HTMLElement>, id: string) => {
		e.preventDefault();
		const element = document.getElementById(id);
		if (element) element.scrollIntoView({ behavior: "smooth" });
	};

	return (
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
	);
};

export default Nav;
