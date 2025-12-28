import { Clock, Users, Code, Globe, UserPlus } from "lucide-react";

type ConfigureCollaborationSessionStepProps = {
	selectedProblem: any;
	selectedLanguage: string;
	setSelectedLanguage: (lang: string) => void;
	timeLimit: number;
	setTimeLimit: (n: number) => void;
	playerCount: number;
	setPlayerCount: (n: number) => void;
	isPublic: boolean;
	setIsPublic: (v: boolean) => void;
	allowJoinInProgress: boolean;
	setAllowJoinInProgress: (v: boolean) => void;
	description: string;
	setDescription: (v: string) => void;
};

const ConfigureCollaborationSessionStep = ({
	selectedProblem,
	selectedLanguage,
	setSelectedLanguage,
	timeLimit,
	setTimeLimit,
	playerCount,
	setPlayerCount,
	isPublic,
	setIsPublic,
	allowJoinInProgress,
	setAllowJoinInProgress,
	description,
	setDescription,
}: ConfigureCollaborationSessionStepProps) => {
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

	// Longer time limits for collaboration
	const availableTimeLimits = [30, 45, 60, 90, 120, 180];
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
					Please select a project in the previous step first.
				</p>
			</div>
		);
	}

	return (
		<div className="p-6">
			{/* Selected Problem Info */}
			<div className="bg-[#2a2a2a] rounded-lg p-4 mb-6 border border-purple-500/30">
				<h3 className="font-medium text-lg text-white flex items-center gap-2">
					<Code size={20} className="text-purple-500" />
					{selectedProblem?.title || "Project Title Missing"}
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

			{/* Session Description */}
			<div className="mb-6">
				<label className="block text-gray-200 font-medium mb-2">
					Session Description (Optional)
				</label>
				<textarea
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Describe what you want to accomplish in this collaboration..."
					className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
					rows={2}
				/>
			</div>

			{/* Configuration Options */}
			<div className="grid md:grid-cols-3 gap-6 mb-6">
				{/* Time Limit */}
				<div className="space-y-3">
					<div className="flex items-center gap-2 text-gray-200 font-medium">
						<Clock size={18} className="text-purple-500" />
						<h4>Time Limit</h4>
					</div>
					<div className="grid grid-cols-3 gap-2">
						{availableTimeLimits.map((time) => (
							<button
								key={time}
								className={`py-2 px-1 rounded-md text-center transition text-sm ${
									timeLimit === time
										? "bg-purple-500 text-white font-medium"
										: "bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]"
								}`}
								onClick={() => setTimeLimit(time)}
							>
								{time} min
							</button>
						))}
					</div>
					<p className="text-xs text-gray-400">
						Collaboration sessions typically need more time
					</p>
				</div>

				{/* Number of Collaborators */}
				<div className="space-y-3">
					<div className="flex items-center gap-2 text-gray-200 font-medium">
						<Users size={18} className="text-purple-500" />
						<h4>Collaborators</h4>
					</div>
					<div className="grid grid-cols-3 gap-2">
						{availablePlayerCounts.map((count) => (
							<button
								key={count}
								className={`py-2 px-1 rounded-md text-center transition ${
									playerCount === count
										? "bg-purple-500 text-white font-medium"
										: "bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]"
								}`}
								onClick={() => setPlayerCount(count)}
							>
								{count} {count === 1 ? "person" : "people"}
							</button>
						))}
					</div>
					<p className="text-xs text-gray-400">
						Including you - invite {playerCount - 1} other{" "}
						{playerCount - 1 === 1 ? "collaborator" : "collaborators"}
					</p>
				</div>

				{/* Programming Language */}
				<div className="space-y-3">
					<div className="flex items-center gap-2 text-gray-200 font-medium">
						<Code size={18} className="text-purple-500" />
						<h4>Programming Language</h4>
					</div>
					<select
						value={selectedLanguage}
						onChange={(e) => setSelectedLanguage(e.target.value)}
						className="w-full bg-[#3a3a3a] border border-gray-700 rounded-md py-2 px-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
					>
						{programmingLanguages.map((lang) => (
							<option key={lang.id} value={lang.id}>
								{lang.name}
							</option>
						))}
					</select>
					<p className="text-xs text-gray-400">
						Primary language for the session
					</p>
				</div>
			</div>

			{/* Collaboration-Specific Options */}
			<div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-4 mb-6">
				<h4 className="font-medium text-white mb-4 flex items-center gap-2">
					<UserPlus size={18} className="text-purple-500" />
					Collaboration Options
				</h4>

				<div className="space-y-4">
					{/* Public Session Toggle */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Globe size={18} className="text-gray-400" />
							<div>
								<p className="text-white font-medium">Public Session</p>
								<p className="text-xs text-gray-400">
									Allow anyone to discover and request to join
								</p>
							</div>
						</div>
						<button
							onClick={() => setIsPublic(!isPublic)}
							className={`relative w-12 h-6 rounded-full transition-colors ${
								isPublic ? "bg-purple-500" : "bg-gray-600"
							}`}
						>
							<span
								className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
									isPublic ? "left-7" : "left-1"
								}`}
							/>
						</button>
					</div>

					{/* Allow Join In Progress Toggle */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<UserPlus size={18} className="text-gray-400" />
							<div>
								<p className="text-white font-medium">Allow Late Joiners</p>
								<p className="text-xs text-gray-400">
									Let collaborators join after the session starts
								</p>
							</div>
						</div>
						<button
							onClick={() => setAllowJoinInProgress(!allowJoinInProgress)}
							className={`relative w-12 h-6 rounded-full transition-colors ${
								allowJoinInProgress ? "bg-purple-500" : "bg-gray-600"
							}`}
						>
							<span
								className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
									allowJoinInProgress ? "left-7" : "left-1"
								}`}
							/>
						</button>
					</div>
				</div>
			</div>

			{/* Session Settings Preview */}
			<div className="p-4 bg-[#2a2a2a] border border-purple-500/30 rounded-lg">
				<h4 className="font-medium text-white mb-2">Session Preview</h4>
				<div className="grid sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
					<div>
						<span className="text-gray-400">Project:</span>
						<span className="text-white ml-2">
							{selectedProblem?.title || "N/A"}
						</span>
					</div>
					<div>
						<span className="text-gray-400">Time Limit:</span>
						<span className="text-white ml-2">{timeLimit} minutes</span>
					</div>
					<div>
						<span className="text-gray-400">Collaborators:</span>
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
					<div>
						<span className="text-gray-400">Visibility:</span>
						<span className="text-white ml-2">
							{isPublic ? "Public" : "Private"}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ConfigureCollaborationSessionStep;
