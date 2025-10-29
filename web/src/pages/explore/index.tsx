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
					description="Select how you want to code together. Each mode is optimized for different collaboration and rivalisation styles and goals."
				/>

				{/* Mode Selection Cards */}
				<section className="grid md:grid-cols-2 gap-8 mb-24">
					{/* LeetCode Mode Card */}
					<ExploreCard
						title="LeetCode Mode"
						description="Solve coding challenges together with a timer. Perfect for interview preparation, algorithm practice, and educational sessions."
						headerGradient="bg-gradient-to-r from-[#5bc6ca] to-[#48aeb3]"
						headerContent={
							<>
								{/* Left curly bracket - closer to vertical center */}
								<div className="absolute top-1/4 left-6 text-5xl opacity-20 text-black">
									{"{"}
								</div>

								{/* Right curly bracket - closer to vertical center */}
								<div className="absolute bottom-1/4 right-6 text-5xl opacity-20 text-black">
									{"}"}
								</div>

								{/* Centered loop statement */}
								<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] md:w-[500px] text-3xl font-mono opacity-30 text-black text-center leading-snug ">
									for (let i = 0; i {"<"} 10; i++)
								</div>
							</>
						}
						icon={<Code size={20} className="text-[#5bc6ca]" />}
						features={[
							{ icon: <Clock size={16} />, text: "Timed sessions" },
							{ icon: <Users size={16} />, text: "2-4 participants" },
							{ icon: <Star size={16} />, text: "Curated problems" },
							{ icon: <Zap size={16} />, text: "Performance tracking" },
						]}
						footerText="20+ problem sets available"
						buttonText="Start Session"
						buttonOnClick={() => setIsCompetitionModalOpen(true)}
						tagText="Interview Prep & Problem Solving"
					/>

					{/* Codebase Mode Card */}
					<ExploreCard
						title="Codebase Mode"
						description="Debug, review, and enhance codebases as a team. Perfect for solving tough problems together."
						headerGradient="bg-gradient-to-r from-[#3a3a3a] to-[#2c2c2c]"
						headerContent={
							<>
								<div className="absolute top-[20%] left-[15%] text-xl sm:text-2xl opacity-30 text-white font-mono whitespace-nowrap max-w-full">
									/src
								</div>
								<div className="absolute top-[40%] left-[30%] text-xl sm:text-2xl opacity-30 text-white font-mono whitespace-nowrap max-w-full">
									/components
								</div>
								<div className="absolute bottom-[30%] left-[65%] text-xl sm:text-2xl opacity-30 text-white font-mono whitespace-nowrap max-w-full">
									/pages
								</div>
								<div className="absolute top-[25%] right-[15%] text-xl sm:text-2xl opacity-30 text-white font-mono whitespace-nowrap max-w-full">
									index.js
								</div>
							</>
						}
						icon={<Rocket size={20} className="text-[#5bc6ca]" />}
						features={[
							{
								icon: (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
										<polyline points="14 2 14 8 20 8" />
									</svg>
								),
								text: "Shared file tree",
							},
							{
								icon: (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<circle cx="12" cy="12" r="10" />
										<line x1="12" y1="8" x2="12" y2="12" />
										<line x1="12" y1="16" x2="12" y2="16" />
									</svg>
								),
								text: "Live sync",
							},
							{
								icon: (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" />
										<path d="M18 20C18 17.7909 15.3137 16 12 16C8.68629 16 6 17.7909 6 20" />
									</svg>
								),
								text: "Multi-user cursors",
							},
							{
								icon: (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<circle cx="12" cy="12" r="10" />
										<polyline points="12 6 12 12 16 14" />
									</svg>
								),
								text: "Complex problems",
							},
						]}
						footerText="5+ project-level problems"
						buttonText="Start Collaboration"
						buttonOnClick={() => setIsCollaborationModalOpen(true)}
						tagText="Project Development & Collaboration"
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
