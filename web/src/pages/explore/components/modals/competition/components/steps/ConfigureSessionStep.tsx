import { Clock, Users, Code } from "lucide-react";

type ConfigureSessionStepProps = {
	selectedProblem: any;
	selectedLanguage: string;
	setSelectedLanguage: (lang: string) => void;
	timeLimit: number;
	setTimeLimit: (n: number) => void;
	playerCount: number;
	setPlayerCount: (n: number) => void;
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
	const programmingLanguages = [
		{ id: "javascript", name: "JavaScript" },
		{ id: "python", name: "Python" },
		{ id: "java", name: "Java" },
		{ id: "cpp", name: "C++" },
		{ id: "csharp", name: "C#" },
		{ id: "go", name: "Go" },
		{ id: "ruby", name: "Ruby" },
		{ id: "typescript", name: "TypeScript" },
		{ id: "php", name: "PHP" },
		{ id: "swift", name: "Swift" },
		{ id: "kotlin", name: "Kotlin" },
		{ id: "rust", name: "Rust" },
	];

	const availableTimeLimits = [15, 30, 45, 60, 90, 120];
	const availablePlayerCounts = [2, 3, 4];

	const getDifficultyColor = (difficulty: any) => {
		if (!difficulty) return "text-gray-500";
		switch (String(difficulty).toLowerCase()) {
			case "easy":
				return "text-green-500";
			case "medium":
				return "text-yellow-500";
			case "hard":
				return "text-red-500";
			default:
				return "text-gray-500";
		}
	};

	if (!selectedProblem) {
		return (
			<div className="p-6 flex items-center justify-center h-64">
				<p className="text-gray-400">
					Please select a problem in the previous step first.
				</p>
			</div>
		);
	}

	return (
		<div className="p-6">
			{/* Selected Problem Info */}
			<div className="bg-[#2a2a2a] rounded-lg p-4 mb-6 border border-gray-700">
				<h3 className="font-medium text-lg text-white flex items-center gap-2">
					<Code size={20} className="text-[#5bc6ca]" />
					{selectedProblem?.title || "Problem Title Missing"}
				</h3>
				<p
					className={`text-sm font-medium mt-1 ${getDifficultyColor(
						selectedProblem?.difficulty
					)}`}
				>
					{selectedProblem?.difficulty || "N/A"}
				</p>
				<p className="text-gray-400 text-sm mt-2 line-clamp-2">
					{selectedProblem?.description || "No description available."}
				</p>
			</div>

			{/* Configuration Options */}
			<div className="grid md:grid-cols-3 gap-6">
				{/* Time Limit */}
				<div className="space-y-3">
					<div className="flex items-center gap-2 text-gray-200 font-medium">
						<Clock size={18} className="text-[#5bc6ca]" />
						<h4>Time Limit</h4>
					</div>
					<div className="grid grid-cols-3 gap-2">
						{availableTimeLimits.map((time) => (
							<button
								key={time}
								className={`py-2 px-1 rounded-md text-center transition ${
									timeLimit === time
										? "bg-[#5bc6ca] text-black font-medium"
										: "bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]"
								}`}
								onClick={() => setTimeLimit(time)}
							>
								{time} min
							</button>
						))}
					</div>
					<p className="text-xs text-gray-400">
						How much time players will have to solve the problem
					</p>
				</div>

				{/* Number of Players */}
				<div className="space-y-3">
					<div className="flex items-center gap-2 text-gray-200 font-medium">
						<Users size={18} className="text-[#5bc6ca]" />
						<h4>Number of Players</h4>
					</div>
					<div className="grid grid-cols-3 gap-2">
						{availablePlayerCounts.map((count) => (
							<button
								key={count}
								className={`py-2 px-1 rounded-md text-center transition ${
									playerCount === count
										? "bg-[#5bc6ca] text-black font-medium"
										: "bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]"
								}`}
								onClick={() => setPlayerCount(count)}
							>
								{count} {count === 1 ? "player" : "players"}
							</button>
						))}
					</div>
					<p className="text-xs text-gray-400">
						Including you - you'll invite {playerCount - 1} other{" "}
						{playerCount - 1 === 1 ? "player" : "players"}
					</p>
				</div>

				{/* Programming Language */}
				<div className="space-y-3">
					<div className="flex items-center gap-2 text-gray-200 font-medium">
						<Code size={18} className="text-[#5bc6ca]" />
						<h4>Programming Language</h4>
					</div>
					<select
						value={selectedLanguage}
						onChange={(e) => setSelectedLanguage(e.target.value)}
						className="w-full bg-[#3a3a3a] border border-gray-700 rounded-md py-2 px-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5bc6ca]"
					>
						{programmingLanguages.map((lang) => (
							<option key={lang.id} value={lang.id}>
								{lang.name}
							</option>
						))}
					</select>
					<p className="text-xs text-gray-400">
						The programming language all players will use
					</p>
				</div>
			</div>

			{/* Session Settings Preview */}
			<div className="mt-8 p-4 bg-[#2a2a2a] border border-gray-700 rounded-lg">
				<h4 className="font-medium text-white mb-2">Session Preview</h4>
				<div className="grid sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
					<div>
						<span className="text-gray-400">Problem:</span>
						<span className="text-white ml-2">
							{selectedProblem?.title || "N/A"}
						</span>
					</div>
					<div>
						<span className="text-gray-400">Time Limit:</span>
						<span className="text-white ml-2">{timeLimit} minutes</span>
					</div>
					<div>
						<span className="text-gray-400">Players:</span>
						<span className="text-white ml-2">{playerCount}</span>
					</div>
					<div>
						<span className="text-gray-400">Difficulty:</span>
						<span
							className={`ml-2 ${getDifficultyColor(
								selectedProblem?.difficulty
							)}`}
						>
							{selectedProblem?.difficulty || "N/A"}
						</span>
					</div>
					<div>
						<span className="text-gray-400">Language:</span>
						<span className="text-white ml-2">
							{
								programmingLanguages.find((l) => l.id === selectedLanguage)
									?.name
							}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ConfigureSessionStep;
