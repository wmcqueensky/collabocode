// ...existing code...
import React from "react";
import Hero from "./components/Hero";
import Nav from "./components/Nav";
import WhyCollaborate from "./components/WhyCollaborate";
import OurStory from "./components/OurStory";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import FinalCTA from "./components/FinalCTA";

const HomePage: React.FC = () => {
	return (
		<main className="text-gray-200">
			<Hero />
			<Nav />
			<WhyCollaborate />
			<OurStory />
			<HowItWorks />
			<Features />
			<FinalCTA />
		</main>
	);
};

export default HomePage;
