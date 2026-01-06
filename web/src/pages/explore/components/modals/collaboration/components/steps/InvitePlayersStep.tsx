import { useState } from "react";
import { Search, Users, Clock, Code, Check, Loader2 } from "lucide-react";
import type { Problem, Profile } from "../../../../../../types/database";

type InvitePlayersStepProps = {
	selectedProblem: Problem | null;
	selectedLanguage: string;
	selectedPlayers: Profile[];
	setSelectedPlayers: (players: Profile[]) => void;
	availablePlayers: Profile[];
	playerCount: number;
	timeLimit: number;
	loading?: boolean;
	searchUsers?: (query: string) => Promise<Profile[]>;
};

// Violet accent colors
const ACCENT = {
	bg: "bg-[#8b5cf6]",
	bgLight: "bg-[#8b5cf6]/10",
	text: "text-[#a78bfa]",
	border: "border-[#8b5cf6]",
	focus: "focus:ring-[#8b5cf6]",
};

const InvitePlayersStep = ({
	selectedProblem,
	selectedLanguage,
	selectedPlayers,
	setSelectedPlayers,
	availablePlayers,
	playerCount,
	timeLimit,
	loading = false,
	searchUsers,
}: InvitePlayersStepProps) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [searching, setSearching] = useState(false);
	const [searchResults, setSearchResults] = useState<Profile[]>([]);

	// Calculate how many more players are needed
	const requiredPlayers = Math.max(0, playerCount - 1);
	const remainingPlayers = requiredPlayers - selectedPlayers.length;

	// Handle search
	const handleSearch = async (query: string) => {
		setSearchQuery(query);
		if (query.length >= 2 && searchUsers) {
			setSearching(true);
			try {
				const results = await searchUsers(query);
				setSearchResults(results);
			} catch (error) {
				console.error("Search error:", error);
			} finally {
				setSearching(false);
			}
		} else {
			setSearchResults([]);
		}
	};

	// Get players to display
	const displayPlayers =
		searchQuery.length >= 2
			? searchResults
			: availablePlayers.filter(
					(player) =>
						player.username
							?.toLowerCase()
							.includes(searchQuery.toLowerCase()) ||
						player.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
			  );

	// Handle player selection/deselection
	const togglePlayerSelection = (player: Profile) => {
		if (selectedPlayers.some((p) => p.id === player.id)) {
			setSelectedPlayers(selectedPlayers.filter((p) => p.id !== player.id));
		} else if (selectedPlayers.length < requiredPlayers) {
			setSelectedPlayers([...selectedPlayers, player]);
		}
	};

	const getLanguageDisplayName = (languageId: string): string => {
		const languages: Record<string, string> = {
			javascript: "JavaScript",
			python: "Python",
			typescript: "TypeScript",
			java: "Java",
			cpp: "C++",
		};
		return languages[languageId] || languageId;
	};

	const getInitials = (player: Profile) => {
		if (player.full_name) {
			return player.full_name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2);
		}
		return player.username?.[0]?.toUpperCase() || "U";
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 size={32} className={`${ACCENT.text} animate-spin`} />
			</div>
		);
	}

	return (
		<div className="p-4 sm:p-6">
			{/* Session Info */}
			<div className="bg-[#2a2a2a] rounded-lg p-4 mb-6 border border-gray-700">
				<h3 className="font-medium text-white mb-3">Session Details</h3>
				<div className="grid grid-cols-3 gap-4 text-sm">
					<div className="flex items-center">
						<Code size={16} className={`${ACCENT.text} mr-2`} />
						<div>
							<div className="text-gray-400 text-xs">Problem</div>
							<div className="text-white truncate">
								{selectedProblem?.title || "—"}
							</div>
						</div>
					</div>
					<div className="flex items-center">
						<Clock size={16} className={`${ACCENT.text} mr-2`} />
						<div>
							<div className="text-gray-400 text-xs">Time</div>
							<div className="text-white">{timeLimit} min</div>
						</div>
					</div>
					<div className="flex items-center">
						<Code size={16} className={`${ACCENT.text} mr-2`} />
						<div>
							<div className="text-gray-400 text-xs">Language</div>
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
						<Users size={18} className={`${ACCENT.text} mr-2`} />
						Invite Collaborators
					</h3>
					<div className="text-sm text-gray-400">
						{selectedPlayers.length} of {requiredPlayers} selected
					</div>
				</div>

				<div className="h-2 bg-gray-700 rounded-full overflow-hidden">
					<div
						className={`h-full ${ACCENT.bg} rounded-full transition-all duration-300`}
						style={{
							width:
								requiredPlayers > 0
									? `${(selectedPlayers.length / requiredPlayers) * 100}%`
									: "100%",
						}}
					/>
				</div>

				<div className="text-sm mt-2 text-gray-300">
					{remainingPlayers > 0 ? (
						<span>
							Select {remainingPlayers} more{" "}
							{remainingPlayers === 1 ? "collaborator" : "collaborators"}
						</span>
					) : (
						<span className="text-green-400 flex items-center">
							<Check size={16} className="mr-1" />
							All collaborators selected! Ready to start.
						</span>
					)}
				</div>
			</div>

			{/* Search */}
			<div className="relative mb-4">
				<input
					type="text"
					placeholder="Search by name or username..."
					className={`w-full bg-[#2a2a2a] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 ${ACCENT.focus}`}
					value={searchQuery}
					onChange={(e) => handleSearch(e.target.value)}
				/>
				<Search className="absolute left-3 top-3 text-gray-400" size={18} />
				{searching && (
					<Loader2
						className={`absolute right-3 top-3 ${ACCENT.text} animate-spin`}
						size={18}
					/>
				)}
			</div>

			{/* Player List */}
			<div className="grid md:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-2">
				{displayPlayers.map((player) => (
					<div
						key={player.id}
						className={`p-3 rounded-lg border transition-all cursor-pointer ${
							selectedPlayers.some((p) => p.id === player.id)
								? `${ACCENT.border} ${ACCENT.bgLight}`
								: "border-gray-700 bg-[#2a2a2a] hover:border-gray-500"
						}`}
						onClick={() => togglePlayerSelection(player)}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<div className="relative">
									{player.avatar_url ? (
										<img
											src={player.avatar_url}
											alt={player.username}
											className="w-10 h-10 rounded-full object-cover"
										/>
									) : (
										<div
											className={`w-10 h-10 rounded-full ${ACCENT.bgLight} flex items-center justify-center ${ACCENT.text} font-medium`}
										>
											{getInitials(player)}
										</div>
									)}
								</div>

								<div className="ml-3">
									<div className="text-white font-medium">
										{player.full_name || player.username}
									</div>
									<div className="text-gray-400 text-sm">
										@{player.username}
									</div>
								</div>
							</div>

							{/* Selection Indicator */}
							<div
								className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
									selectedPlayers.some((p) => p.id === player.id)
										? ACCENT.bg
										: "bg-gray-700"
								}`}
							>
								{selectedPlayers.some((p) => p.id === player.id) && (
									<Check size={14} className="text-white" />
								)}
							</div>
						</div>

						{/* Player Stats */}
						<div className="mt-2 flex items-center text-xs text-gray-400">
							<span className="mr-3">
								⭐ {player.collaboration_rating || 1500}
							</span>
							<span>🤝 {player.collaboration_solved || 0} collabs</span>
						</div>
					</div>
				))}

				{displayPlayers.length === 0 && !searching && (
					<div className="col-span-2 text-center py-10 text-gray-400">
						{searchQuery
							? "No users found matching your search"
							: "No users available"}
					</div>
				)}
			</div>
		</div>
	);
};

export default InvitePlayersStep;
