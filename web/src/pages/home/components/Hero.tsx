import { useEffect, useState, useRef } from "react";

const slogans = [
	"Code is better with company.",
	"From Solo to Synergy.",
	"Code better, together.",
	"Collaboration, compiled.",
	"From solo to squad.",
];

const Hero = () => {
	const [text, setText] = useState("");
	const [index, setIndex] = useState(0);
	const [charIndex, setCharIndex] = useState(0);
	const [isDeleting, setIsDeleting] = useState(false);

	const videoRef = useRef<HTMLVideoElement | null>(null);

	const tryPlayVideo = () => {
		const v = videoRef.current;
		if (!v) return;
		const p = v.play();
		if (p && typeof p.catch === "function")
			p.catch(() => {
				// ignore play rejections
			});
	};

	useEffect(() => {
		tryPlayVideo();
		const onPageShow = () => tryPlayVideo();
		const onVisibilityChange = () => {
			if (!document.hidden) tryPlayVideo();
		};
		const onFocus = () => tryPlayVideo();

		window.addEventListener("pageshow", onPageShow);
		document.addEventListener("visibilitychange", onVisibilityChange);
		window.addEventListener("focus", onFocus);

		return () => {
			window.removeEventListener("pageshow", onPageShow);
			document.removeEventListener("visibilitychange", onVisibilityChange);
			window.removeEventListener("focus", onFocus);
		};
	}, []);

	useEffect(() => {
		const current = slogans[index];
		const speed = isDeleting ? 40 : 100;

		const timeout = setTimeout(() => {
			setText(
				isDeleting
					? current.substring(0, Math.max(0, charIndex - 1))
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
		if (element) element.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<section id="hero" className="relative min-h-screen w-full overflow-hidden">
			<video
				ref={videoRef}
				autoPlay
				loop
				muted
				playsInline
				className="absolute inset-0 w-full h-full object-cover"
				src="/coding.mp4"
			/>
			<div className="absolute inset-0 bg-black/70" />

			<div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
				<div className="flex items-center space-x-3 mb-4">
					<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold flex items-center flex-wrap justify-center">
						{/* Logo icon with violet color */}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="w-10 h-10 md:w-14 md:h-14 text-[#a78bfa]"
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

				{/* Gradient text animation - teal to violet */}
				<p className="text-xl sm:text-2xl md:text-3xl font-mono bg-gradient-to-r from-[#5bc6ca] to-[#a78bfa] bg-clip-text text-transparent h-10">
					{text}
					<span className="animate-pulse">|</span>
				</p>

				<div className="flex flex-wrap justify-center gap-4 py-4 mt-8">
					{/* Primary CTA - Teal (Challenge focus) */}
					<a href="/explore">
						<button className="px-6 py-3 bg-[#5bc6ca] text-black font-semibold rounded-xl hover:bg-[#48aeb3] transition shadow-lg shadow-[#5bc6ca]/20">
							Start Challenge →
						</button>
					</a>
					{/* Secondary CTA - Violet (Collaboration focus) */}
					<a href="/explore">
						<button className="px-6 py-3 bg-[#8b5cf6] text-white font-semibold rounded-xl hover:bg-[#7c3aed] transition shadow-lg shadow-[#8b5cf6]/20">
							Collaborate Now →
						</button>
					</a>
					<button
						onClick={(e) => scrollToSection(e, "why-collaboration")}
						className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition border border-white/20"
					>
						Learn More ↓
					</button>
				</div>
			</div>
		</section>
	);
};

export default Hero;
