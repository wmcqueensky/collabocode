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

	// added ref + resume helpers for Safari back/forward cache issues
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const tryPlayVideo = () => {
		const v = videoRef.current;
		if (!v) return;
		const p = v.play();
		if (p && typeof p.catch === "function")
			p.catch(() => {
				// ignore play rejections (autoplay policies) — we'll retry on visibility/focus/pageshow
			});
	};

	useEffect(() => {
		// try play on mount, and when page is shown / becomes visible / window focused
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
	);
};

export default Hero;
