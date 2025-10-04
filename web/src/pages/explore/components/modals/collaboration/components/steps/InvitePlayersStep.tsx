import { useState } from "react";
import { Search, Users, Clock, Code, Check } from "lucide-react";

type Player = {
	id: string | number;
	name: string;
	username: string;
	avatar?: string;
	online?: boolean;
	rating?: number;
	successfulCollabos?: number;
	matchHistory?: string[];
};

type InvitePlayersStepProps = {
	selectedProblem: any;
	selectedLanguage: string;
	selectedPlayers: Player[];
	setSelectedPlayers: (players: Player[]) => void;
	availablePlayers: Player[];
	playerCount: number;
};

const InvitePlayersStep = ({
	selectedProblem,
	selectedLanguage,
	selectedPlayers,
	setSelectedPlayers,
	availablePlayers,
	playerCount,
}: InvitePlayersStepProps) => {
	const [searchQuery, setSearchQuery] = useState("");

	// Calculate how many more players are needed
	const requiredPlayers = Math.max(0, playerCount - 1); // Excluding current user
	const remainingPlayers = requiredPlayers - selectedPlayers.length;

	// Filter players based on search query
	const filteredPlayers = availablePlayers.filter(
		(player) =>
			player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			player.username.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Handle player selection/deselection
	const togglePlayerSelection = (player: Player) => {
		if (selectedPlayers.some((p) => p.id === player.id)) {
			setSelectedPlayers(selectedPlayers.filter((p) => p.id !== player.id));
		} else {
			if (selectedPlayers.length < requiredPlayers) {
				setSelectedPlayers([...selectedPlayers, player]);
			}
		}
	};

	// Get programming language display name
	const getLanguageDisplayName = (languageId: string): string => {
		const languages: Record<string, string> = {
			javascript: "JavaScript",
			python: "Python",
			java: "Java",
			cpp: "C++",
			csharp: "C#",
			go: "Go",
			ruby: "Ruby",
			typescript: "TypeScript",
			php: "PHP",
			swift: "Swift",
			kotlin: "Kotlin",
			rust: "Rust",
		};
		return languages[languageId] || languageId;
	};

	return (
		<div className="p-6">
			{/* Session Info */}
			<div className="bg-[#2a2a2a] rounded-lg p-4 mb-6 border border-gray-700">
				<h3 className="font-medium text-white mb-3">Session Details</h3>
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
					<div className="flex items-center">
						<Code size={16} className="text-[#5bc6ca] mr-2" />
						<div>
							<div className="text-gray-400">Problem</div>
							<div className="text-white">{selectedProblem?.title}</div>
						</div>
					</div>
					<div className="flex items-center">
						<Clock size={16} className="text-[#5bc6ca] mr-2" />
						<div>
							<div className="text-gray-400">Time Limit</div>
							<div className="text-white">
								{selectedProblem?.timeLimit || "30"} minutes
							</div>
						</div>
					</div>
					<div className="flex items-center">
						<Code size={16} className="text-[#5bc6ca] mr-2" />
						<div>
							<div className="text-gray-400">Language</div>
							<div className="text-white">
								{getLanguageDisplayName(selectedLanguage)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Invitation Progress */}
			<div className="mb-6">
				<div className="flex justify-between items-center mb-2">
					<h3 className="text-white font-medium flex items-center">
						<Users size={18} className="text-[#5bc6ca] mr-2" />
						Invite Players
					</h3>
					<div className="text-sm text-gray-400">
						{selectedPlayers.length} of {requiredPlayers} selected
					</div>
				</div>

				<div className="h-2 bg-gray-700 rounded-full overflow-hidden">
					<div
						className="h-full bg-[#5bc6ca] rounded-full transition-all"
						style={{
							width:
								requiredPlayers > 0
									? `${(selectedPlayers.length / requiredPlayers) * 100}%`
									: "100%",
						}}
					></div>
				</div>

				{/* Status message */}
				<div className="text-sm mt-2 text-gray-300">
					{remainingPlayers > 0 ? (
						<span>
							Please select {remainingPlayers} more{" "}
							{remainingPlayers === 1 ? "player" : "players"}
						</span>
					) : (
						<span className="text-green-400 flex items-center">
							<Check size={16} className="mr-1" />
							All players selected! Ready to start.
						</span>
					)}
				</div>
			</div>

			{/* Player Selection */}
			<div>
				{/* Search */}
				<div className="relative mb-4">
					<input
						type="text"
						placeholder="Search for players by name or username..."
						className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[#5bc6ca]"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
				</div>

				{/* Player List */}
				<div className="grid md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
					{filteredPlayers.map((player) => (
						<div
							key={player.id}
							className={`p-3 rounded-lg border transition-all cursor-pointer ${
								selectedPlayers.some((p) => p.id === player.id)
									? "border-[#5bc6ca] bg-[#5bc6ca10]"
									: "border-gray-700 bg-[#2a2a2a] hover:border-gray-500"
							}`}
							onClick={() => togglePlayerSelection(player)}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<div className="relative">
										{player.avatar ? (
											<img
												src={player.avatar}
												alt={player.name}
												className="w-10 h-10 rounded-full object-cover"
											/>
										) : (
											<div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-200 font-medium">
												{player.name?.charAt(0)}
											</div>
										)}
										<div
											className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1f1f1f] ${
												player.online ? "bg-green-500" : "bg-gray-500"
											}`}
										></div>
									</div>

									<div className="ml-3">
										<div className="text-white font-medium">{player.name}</div>
										<div className="text-gray-400 text-sm">
											@{player.username}
										</div>
									</div>
								</div>

								{/* Selection Indicator */}
								<div
									className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
										selectedPlayers.some((p) => p.id === player.id)
											? "bg-[#5bc6ca]"
											: "bg-gray-700"
									}`}
								>
									{selectedPlayers.some((p) => p.id === player.id) && (
										<Check size={14} className="text-black" />
									)}
								</div>
							</div>

							{/* Player Stats */}
							<div className="mt-2 flex items-center justify-between text-xs text-gray-400">
								<div>
									<span className="inline-block mr-3">
										⭐ {player.rating || 0} Rating
									</span>
									<span className="inline-block">
										🕊️ {player.successfulCollabos || 0} Collaborations
									</span>
								</div>

								{player.matchHistory && (
									<div className="flex gap-1">
										{player.matchHistory.slice(0, 5).map((result, index) => (
											<div
												key={index}
												className={`w-2 h-2 rounded-full ${
													result === "win"
														? "bg-green-500"
														: result === "loss"
														? "bg-red-500"
														: "bg-yellow-500"
												}`}
												title={result}
											></div>
										))}
									</div>
								)}
							</div>
						</div>
					))}

					{filteredPlayers.length === 0 && (
						<div className="col-span-2 text-center py-10 text-gray-400">
							No players found matching your search criteria
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default InvitePlayersStep;
