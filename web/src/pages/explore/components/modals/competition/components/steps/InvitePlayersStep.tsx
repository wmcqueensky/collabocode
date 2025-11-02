// InvitePlayersStep.tsx
import { useState, useEffect } from "react";
import { Search, Users, Clock, Code, Check, Loader2 } from "lucide-react";
import { supabase } from "../../../../../../../lib/supabase";
import type { Problem, Profile } from "../../../../../../../types/database";

type InvitePlayersStepProps = {
	selectedProblem: Problem | null;
	selectedLanguage: string;
	selectedPlayers: Profile[];
	setSelectedPlayers: (players: Profile[]) => void;
	availablePlayers: Profile[];
	playerCount: number;
	timeLimit: number;
	loading?: boolean;
	searchUsers: (query: string) => Promise<Profile[]>;
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
	const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

	// Calculate how many more players are needed
	const requiredPlayers = playerCount - 1; // Excluding the current user
	const remainingPlayers = requiredPlayers - selectedPlayers.length;

	// Debounced search
	useEffect(() => {
		const timer = setTimeout(async () => {
			if (searchQuery.trim().length >= 2) {
				setSearching(true);
				try {
					const results = await searchUsers(searchQuery);
					setSearchResults(results);
				} catch (error) {
					console.error("Search error:", error);
				} finally {
					setSearching(false);
				}
			} else {
				setSearchResults([]);
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery, searchUsers]);

	// Track online presence
	useEffect(() => {
		const channel = supabase.channel("online-users");

		channel
			.on("presence", { event: "sync" }, () => {
				const state = channel.presenceState();
				const onlineIds = new Set(
					Object.values(state)
						.flat()
						.map((user: any) => user.user_id)
				);
				setOnlineUsers(onlineIds);
			})
			.subscribe(async (status) => {
				if (status === "SUBSCRIBED") {
					// Track current user's presence
					const {
						data: { user },
					} = await supabase.auth.getUser();
					if (user) {
						await channel.track({ user_id: user.id });
					}
				}
			});

		return () => {
			channel.unsubscribe();
		};
	}, []);

	// Combine friends and search results
	const displayPlayers =
		searchQuery.trim().length >= 2 ? searchResults : availablePlayers;

	// Filter out already selected players from display
	const filteredPlayers = displayPlayers.filter(
		(player: Profile) =>
			!selectedPlayers.some((p: Profile) => p.id === player.id)
	);

	// Handle player selection/deselection
	const togglePlayerSelection = (player: Profile) => {
		if (selectedPlayers.some((p: Profile) => p.id === player.id)) {
			setSelectedPlayers(
				selectedPlayers.filter((p: Profile) => p.id !== player.id)
			);
		} else {
			// Only allow selection if we haven't reached the limit
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
						<Code size={16} className="text-[#5bc6ca] mr-2 flex-shrink-0" />
						<div>
							<div className="text-gray-400">Problem</div>
							<div className="text-white truncate">
								{selectedProblem?.title || "N/A"}
							</div>
						</div>
					</div>
					<div className="flex items-center">
						<Clock size={16} className="text-[#5bc6ca] mr-2 flex-shrink-0" />
						<div>
							<div className="text-gray-400">Time Limit</div>
							<div className="text-white">{timeLimit} minutes</div>
						</div>
					</div>
					<div className="flex items-center">
						<Code size={16} className="text-[#5bc6ca] mr-2 flex-shrink-0" />
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

			{/* Selected Players Preview */}
			{selectedPlayers.length > 0 && (
				<div className="mb-6">
					<h4 className="text-sm font-medium text-gray-300 mb-2">
						Selected Players
					</h4>
					<div className="flex flex-wrap gap-2">
						{selectedPlayers.map((player: Profile) => (
							<div
								key={player.id}
								className="flex items-center gap-2 bg-[#5bc6ca10] border border-[#5bc6ca] rounded-full px-3 py-1"
							>
								<span className="text-sm text-white">{player.username}</span>
								<button
									onClick={() => togglePlayerSelection(player)}
									className="text-[#5bc6ca] hover:text-white transition"
								>
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>
						))}
					</div>
				</div>
			)}

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
						disabled={loading}
					/>
					<Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
					{searching && (
						<Loader2
							className="absolute right-3 top-2.5 text-gray-400 animate-spin"
							size={18}
						/>
					)}
				</div>

				{/* Loading State */}
				{loading && (
					<div className="flex items-center justify-center py-10">
						<Loader2 className="animate-spin text-[#5bc6ca]" size={32} />
						<span className="ml-3 text-gray-400">Loading players...</span>
					</div>
				)}

				{/* Empty State */}
				{!loading &&
					availablePlayers.length === 0 &&
					searchQuery.length < 2 && (
						<div className="text-center py-10 text-gray-400">
							<Users size={48} className="mx-auto mb-3 opacity-50" />
							<p>No friends found</p>
							<p className="text-sm mt-2">
								Try searching for users to invite them
							</p>
						</div>
					)}

				{/* Player List */}
				{!loading && (
					<div className="grid md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
						{filteredPlayers.map((player: Profile) => (
							<div
								key={player.id}
								className={`p-3 rounded-lg border transition-all cursor-pointer ${
									selectedPlayers.some((p: Profile) => p.id === player.id)
										? "border-[#5bc6ca] bg-[#5bc6ca10]"
										: selectedPlayers.length >= requiredPlayers
										? "border-gray-700 bg-[#2a2a2a] opacity-50 cursor-not-allowed"
										: "border-gray-700 bg-[#2a2a2a] hover:border-gray-500"
								}`}
								onClick={() => {
									if (selectedPlayers.length < requiredPlayers) {
										togglePlayerSelection(player);
									}
								}}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center flex-1 min-w-0">
										<div className="relative flex-shrink-0">
											{player.avatar_url ? (
												<img
													src={player.avatar_url}
													alt={player.username}
													className="w-10 h-10 rounded-full object-cover"
												/>
											) : (
												<div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5bc6ca] to-[#48aeb3] flex items-center justify-center text-white font-medium">
													{player.username?.charAt(0).toUpperCase()}
												</div>
											)}
											<div
												className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1f1f1f] ${
													onlineUsers.has(player.id)
														? "bg-green-500"
														: "bg-gray-500"
												}`}
											></div>
										</div>

										<div className="ml-3 flex-1 min-w-0">
											<div className="text-white font-medium truncate">
												{player.full_name || player.username}
											</div>
											<div className="text-gray-400 text-sm truncate">
												@{player.username}
											</div>
										</div>
									</div>

									{/* Selection Indicator */}
									<div
										className={`w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0 ml-2 ${
											selectedPlayers.some((p: Profile) => p.id === player.id)
												? "bg-[#5bc6ca]"
												: "bg-gray-700"
										}`}
									>
										{selectedPlayers.some(
											(p: Profile) => p.id === player.id
										) && <Check size={14} className="text-black" />}
									</div>
								</div>

								{/* Player Stats */}
								<div className="mt-2 flex items-center justify-between text-xs text-gray-400">
									<div>
										<span className="inline-block mr-3">
											⭐ {player.rating || 1500} Rating
										</span>
										<span className="inline-block">
											🏆 {player.problems_solved || 0} Problems
										</span>
									</div>
								</div>
							</div>
						))}

						{filteredPlayers.length === 0 && !loading && (
							<div className="col-span-2 text-center py-10 text-gray-400">
								{searchQuery.length >= 2
									? "No players found matching your search"
									: "Start typing to search for players"}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default InvitePlayersStep;
