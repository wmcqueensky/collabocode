import { Clock, Code, Users, Rocket } from "lucide-react";
import type { Problem } from "../../../../../../../types/database";

type ConfigureCollaborationSessionStepProps = {
	selectedProblem: Problem | null;
	selectedLanguage: string;
	setSelectedLanguage: (language: string) => void;
	timeLimit: number;
	setTimeLimit: (limit: number) => void;
	playerCount: number;
	setPlayerCount: (count: number) => void;
};

const LANGUAGES = [
	{ value: "javascript", label: "JavaScript" },
	{ value: "typescript", label: "TypeScript" },
	{ value: "python", label: "Python" },
];

const TIME_OPTIONS = [
	{ value: 30, label: "30 minutes" },
	{ value: 45, label: "45 minutes" },
	{ value: 60, label: "60 minutes" },
	{ value: 90, label: "90 minutes" },
];

const ConfigureCollaborationSessionStep = ({
	selectedProblem,
	selectedLanguage,
	setSelectedLanguage,
	timeLimit,
	setTimeLimit,
	playerCount,
	setPlayerCount,
}: ConfigureCollaborationSessionStepProps) => {
	return (
		<div className="space-y-4 sm:space-y-6 py-2">
			{/* Selected Problem Summary */}
			{selectedProblem && (
				<div className="bg-[#2a2a2a] rounded-lg p-3 sm:p-4 border border-purple-500/30">
					<div className="flex items-start space-x-3">
						<div className="p-2 bg-purple-500/20 rounded-lg">
							<Rocket className="text-purple-400" size={20} />
						</div>
						<div className="flex-1 min-w-0">
							<h3 className="font-medium text-white text-sm sm:text-base truncate">
								{selectedProblem.title}
							</h3>
							<div className="flex flex-wrap items-center gap-2 mt-1">
								<span
									className={`px-2 py-0.5 rounded-full text-xs ${
										selectedProblem.difficulty === "Easy"
											? "bg-green-500/20 text-green-400"
											: selectedProblem.difficulty === "Medium"
											? "bg-yellow-500/20 text-yellow-400"
											: "bg-red-500/20 text-red-400"
									}`}
								>
									{selectedProblem.difficulty}
								</span>
								{selectedProblem.tags?.slice(0, 2).map((tag, i) => (
									<span
										key={i}
										className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded-full text-xs"
									>
										{tag}
									</span>
								))}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Language Selection */}
			<div>
				<label className="flex items-center text-gray-300 text-sm font-medium mb-2">
					<Code size={16} className="mr-2 text-purple-400" />
					Programming Language
				</label>
				<div className="grid grid-cols-3 gap-2">
					{LANGUAGES.map((lang) => (
						<button
							key={lang.value}
							onClick={() => setSelectedLanguage(lang.value)}
							className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
								selectedLanguage === lang.value
									? "bg-purple-500 text-white"
									: "bg-[#2a2a2a] text-gray-300 hover:bg-[#333] border border-gray-600"
							}`}
						>
							{lang.label}
						</button>
					))}
				</div>
			</div>

			{/* Time Limit */}
			<div>
				<label className="flex items-center text-gray-300 text-sm font-medium mb-2">
					<Clock size={16} className="mr-2 text-purple-400" />
					Time Limit
				</label>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
					{TIME_OPTIONS.map((option) => (
						<button
							key={option.value}
							onClick={() => setTimeLimit(option.value)}
							className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
								timeLimit === option.value
									? "bg-purple-500 text-white"
									: "bg-[#2a2a2a] text-gray-300 hover:bg-[#333] border border-gray-600"
							}`}
						>
							{option.label}
						</button>
					))}
				</div>
			</div>

			{/* Player Count */}
			<div>
				<label className="flex items-center text-gray-300 text-sm font-medium mb-2">
					<Users size={16} className="mr-2 text-purple-400" />
					Team Size
				</label>
				<div className="grid grid-cols-3 gap-2">
					{[2, 3, 4].map((count) => (
						<button
							key={count}
							onClick={() => setPlayerCount(count)}
							className={`px-3 py-3 rounded-lg text-sm font-medium transition-all ${
								playerCount === count
									? "bg-purple-500 text-white"
									: "bg-[#2a2a2a] text-gray-300 hover:bg-[#333] border border-gray-600"
							}`}
						>
							<div className="flex flex-col items-center">
								<span className="text-lg font-bold">{count}</span>
								<span className="text-xs opacity-70">
									{count === 2 ? "Pair" : count === 3 ? "Trio" : "Squad"}
								</span>
							</div>
						</button>
					))}
				</div>
			</div>

			{/* Info Box */}
			<div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
				<h4 className="text-purple-400 font-medium text-sm mb-2">
					🤝 Real-Time Collaboration
				</h4>
				<ul className="text-gray-400 text-xs space-y-1">
					<li>• All team members edit the same code file in real-time</li>
					<li>• See your teammates' cursors as they type</li>
					<li>• Use chat to discuss your approach and strategy</li>
					<li>• Work together to solve the problem before time runs out</li>
					<li>• All members must submit when the solution is ready</li>
				</ul>
			</div>
		</div>
	);
};

export default ConfigureCollaborationSessionStep;
