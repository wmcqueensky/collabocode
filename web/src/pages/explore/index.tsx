import { useState } from "react";
import { Clock, Code, Star, Zap, Users, Rocket } from "lucide-react";
import ExploreCard from "./components/cards/ExploreCard";
import PageTitle from "./components/layout/PageTitle";
import CollaborationModal from "./components/modals/collaboration/CollaborationModal";
import CompetitionModal from "./components/modals/competition/CompetitionModal";

export default function ExplorePage() {
	const [isCollaborationModalOpen, setIsCollaborationModalOpen] =
		useState(false);
	const [isCompetitionModalOpen, setIsCompetitionModalOpen] = useState(false);

	return (
		<main className="min-h-screen bg-[#171717] text-gray-200">
			{/* Main Dashboard */}
			<div className="max-w-6xl mx-auto px-4 py-12">
				<PageTitle
					title="Choose Your Coding Mode"
					description="Select how you want to code together. Each mode is optimized for different collaboration and competition styles and goals."
				/>

				{/* Mode Selection Cards */}
				<section className="grid md:grid-cols-2 gap-8 mb-24">
					{/* Duel Mode Card - Teal theme */}
					<ExploreCard
						title="Duel Mode"
						description="Compete head-to-head against other developers by solving Data Structures and Algorithms problems. Race against the clock and prove your skills in real-time competitive coding battles."
						headerGradient="bg-gradient-to-r from-[#5bc6ca] to-[#48aeb3]"
						headerContent={
							<>
								{/* Left curly bracket */}
								<div className="absolute top-1/4 left-6 text-5xl opacity-20 text-black">
									{"{"}
								</div>

								{/* Right curly bracket */}
								<div className="absolute bottom-1/4 right-6 text-5xl opacity-20 text-black">
									{"}"}
								</div>

								{/* Centered loop statement */}
								<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] md:w-[500px] text-3xl font-mono opacity-30 text-black text-center leading-snug">
									for (let i = 0; i {"<"} 10; i++)
								</div>
							</>
						}
						icon={<Code size={20} className="text-[#5bc6ca]" />}
						features={[
							{ icon: <Clock size={16} />, text: "Timed battles" },
							{ icon: <Users size={16} />, text: "2-4 competitors" },
							{ icon: <Star size={16} />, text: "DSA problems" },
							{ icon: <Zap size={16} />, text: "Live leaderboard" },
						]}
						footerText="20+ DSA problems available"
						buttonText="Start Session"
						buttonOnClick={() => setIsCompetitionModalOpen(true)}
						tagText="Competitive DSA Battles"
						variant="teal"
					/>

					{/* Collabo Mode Card - Violet theme (harmonizes with teal) */}
					<ExploreCard
						title="Collabo Mode"
						description="Work together with your team in real time to solve a shared DSA problem. Collaborate on solutions, share ideas, and learn from each other as you code."
						headerGradient="bg-gradient-to-r from-[#5b21b6] to-[#7c3aed]"
						headerContent={
							<>
								<div className="absolute top-[20%] left-[15%] text-xl sm:text-2xl opacity-30 text-white font-mono whitespace-nowrap max-w-full">
									function solve()
								</div>
								<div className="absolute top-[40%] left-[30%] text-xl sm:text-2xl opacity-30 text-white font-mono whitespace-nowrap max-w-full">
									{"{ }"}
								</div>
								<div className="absolute bottom-[30%] left-[55%] text-xl sm:text-2xl opacity-30 text-white font-mono whitespace-nowrap max-w-full">
									return result
								</div>
								<div className="absolute top-[25%] right-[15%] text-xl sm:text-2xl opacity-30 text-white font-mono whitespace-nowrap max-w-full">
									//team
								</div>
							</>
						}
						icon={<Rocket size={20} className="text-[#a78bfa]" />}
						features={[
							{ icon: <Users size={16} />, text: "2-4 collaborators" },
							{ icon: <Zap size={16} />, text: "Real-time sync" },
							{ icon: <Star size={16} />, text: "DSA problems" },
							{ icon: <Clock size={16} />, text: "Shared editor" },
						]}
						footerText="20+ DSA problems available"
						buttonText="Start Collaboration"
						buttonOnClick={() => setIsCollaborationModalOpen(true)}
						tagText="Team Problem Solving & Learning"
						variant="violet"
					/>
				</section>
			</div>

			<CompetitionModal
				isOpen={isCompetitionModalOpen}
				onClose={() => setIsCompetitionModalOpen(false)}
			/>

			<CollaborationModal
				isOpen={isCollaborationModalOpen}
				onClose={() => setIsCollaborationModalOpen(false)}
			/>
		</main>
	);
}
