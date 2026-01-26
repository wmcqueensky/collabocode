import { Clock, Code, Users, Trophy } from "lucide-react";
import type { ConfigureSessionStepProps } from "../../types";
import {
	PROGRAMMING_LANGUAGES,
	AVAILABLE_TIME_LIMITS,
	AVAILABLE_PLAYER_COUNTS,
	getDifficultyColor,
} from "../../constants";

// Accent colors for competition modal (sky blue)
const ACCENT = {
	bg: "bg-sky-600",
	bgLight: "bg-sky-100",
	bgLighter: "bg-sky-50",
	text: "text-sky-600",
	border: "border-sky-600",
};

const getPlayerCountLabel = (count: number): string => {
	switch (count) {
		case 2:
			return "Duel";
		case 3:
			return "Triple";
		case 4:
			return "Squad";
		default:
			return `${count} players`;
	}
};

const ConfigureSessionStep = ({
	selectedProblem,
	selectedLanguage,
	setSelectedLanguage,
	timeLimit,
	setTimeLimit,
	playerCount,
	setPlayerCount,
}: ConfigureSessionStepProps) => {
	return (
		<div className="p-4 sm:p-6 space-y-5">
			{/* Selected Problem Summary */}
			{selectedProblem && (
				<div className={`bg-gray-50 rounded-lg p-4 border ${ACCENT.border}`}>
					<div className="flex items-start space-x-3">
						<div className={`p-2 ${ACCENT.bgLight} rounded-lg`}>
							<Trophy className={ACCENT.text} size={20} />
						</div>
						<div className="flex-1 min-w-0">
							<h3 className="font-medium text-gray-900 truncate">
								{selectedProblem.title}
							</h3>
							<div className="flex flex-wrap items-center gap-2 mt-1">
								<span
									className={`px-2 py-0.5 rounded-full text-xs ${getDifficultyColor(
										selectedProblem.difficulty,
									)}`}
								>
									{selectedProblem.difficulty}
								</span>
								{selectedProblem.tags
									?.slice(0, 2)
									.map((tag: string, i: number) => (
										<span
											key={i}
											className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs"
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
				<label className="flex items-center text-gray-700 text-sm font-medium mb-2">
					<Code size={16} className={`mr-2 ${ACCENT.text}`} />
					Programming Language
				</label>
				<div className="grid grid-cols-3 gap-2">
					{PROGRAMMING_LANGUAGES.slice(0, 6).map((lang) => (
						<button
							key={lang.id}
							onClick={() => setSelectedLanguage(lang.id)}
							className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
								selectedLanguage === lang.id
									? `${ACCENT.bg} text-white`
									: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
							}`}
						>
							{lang.name}
						</button>
					))}
				</div>
			</div>

			{/* Time Limit */}
			<div>
				<label className="flex items-center text-gray-700 text-sm font-medium mb-2">
					<Clock size={16} className={`mr-2 ${ACCENT.text}`} />
					Time Limit
				</label>
				<div className="grid grid-cols-3 gap-2">
					{AVAILABLE_TIME_LIMITS.map((time) => (
						<button
							key={time}
							onClick={() => setTimeLimit(time)}
							className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
								timeLimit === time
									? `${ACCENT.bg} text-white`
									: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
							}`}
						>
							{time} min
						</button>
					))}
				</div>
			</div>

			{/* Player Count */}
			<div>
				<label className="flex items-center text-gray-700 text-sm font-medium mb-2">
					<Users size={16} className={`mr-2 ${ACCENT.text}`} />
					Number of Players
				</label>
				<div className="grid grid-cols-3 gap-2">
					{AVAILABLE_PLAYER_COUNTS.map((count) => (
						<button
							key={count}
							onClick={() => setPlayerCount(count)}
							className={`px-3 py-3 rounded-lg text-sm font-medium transition-all ${
								playerCount === count
									? `${ACCENT.bg} text-white`
									: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
							}`}
						>
							<div className="flex flex-col items-center">
								<span className="text-lg font-bold">{count}</span>
								<span className="text-xs opacity-70">
									{getPlayerCountLabel(count)}
								</span>
							</div>
						</button>
					))}
				</div>
			</div>

			{/* Info Box */}
			<div
				className={`${ACCENT.bgLighter} border ${ACCENT.border} rounded-lg p-4`}
			>
				<h4 className={`${ACCENT.text} font-medium text-sm mb-2`}>
					⚔️ Competitive Match
				</h4>
				<ul className="text-gray-600 text-xs space-y-1">
					<li>• Each player writes their own solution independently</li>
					<li>• Race against others to solve the problem first</li>
					<li>• Earn rating points based on your performance</li>
					<li>• Fastest correct solution wins the match</li>
				</ul>
			</div>
		</div>
	);
};

export default ConfigureSessionStep;
