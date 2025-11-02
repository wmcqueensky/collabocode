// SelectLeetCodeProblemStep.tsx
import { useState, useEffect } from "react";
import { Code, Search, Star, Loader2 } from "lucide-react";
import type { Problem } from "../../../../../../../types/database";

type SelectLeetCodeProblemStepProps = {
	selectedProblem: Problem | null;
	setSelectedProblem: (p: Problem | null) => void;
	problems: Problem[];
	loading?: boolean;
};

const SelectLeetCodeProblemStep = ({
	selectedProblem,
	setSelectedProblem,
	problems,
	loading = false,
}: SelectLeetCodeProblemStepProps) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedDifficulty, setSelectedDifficulty] = useState("all");
	const [selectedTag, setSelectedTag] = useState("all");

	// Filter problems based on search and filters
	const filteredProblems = problems.filter((problem: Problem) => {
		const matchesSearch =
			searchQuery.trim() === "" ||
			problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			problem.description.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesDifficulty =
			selectedDifficulty === "all" ||
			problem.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

		const matchesTag =
			selectedTag === "all" ||
			(Array.isArray(problem.tags) && problem.tags.includes(selectedTag));

		return matchesSearch && matchesDifficulty && matchesTag;
	});

	// Get all unique tags from problems
	const allTags = Array.from(
		new Set(problems.flatMap((problem: Problem) => problem.tags || []))
	).sort();

	const difficultyBadgeColor = (difficulty: string) => {
		switch ((difficulty || "").toLowerCase()) {
			case "easy":
				return "bg-green-600 text-white";
			case "medium":
				return "bg-yellow-600 text-white";
			case "hard":
				return "bg-red-600 text-white";
			default:
				return "bg-gray-600 text-white";
		}
	};

	// Reset search when problems change
	useEffect(() => {
		if (problems.length === 0) {
			setSearchQuery("");
			setSelectedDifficulty("all");
			setSelectedTag("all");
		}
	}, [problems]);

	return (
		<div className="p-6">
			{/* Search and Filters */}
			<div className="mb-6 space-y-4">
				{/* Search */}
				<div className="relative">
					<input
						type="text"
						placeholder="Search problems by name or description..."
						className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[#5bc6ca]"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						disabled={loading}
					/>
					<Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
				</div>

				{/* Filters */}
				<div className="flex flex-wrap gap-4">
					{/* Difficulty Filter */}
					<div className="space-y-2">
						<label className="text-sm text-gray-300">Difficulty</label>
						<div className="flex gap-2">
							{["all", "easy", "medium", "hard"].map((difficulty) => (
								<button
									key={difficulty}
									className={`px-3 py-1 rounded-md text-sm capitalize transition ${
										selectedDifficulty === difficulty
											? "bg-[#5bc6ca] text-black font-medium"
											: "bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]"
									}`}
									onClick={() => setSelectedDifficulty(difficulty)}
									disabled={loading}
								>
									{difficulty === "all" ? "All" : difficulty}
								</button>
							))}
						</div>
					</div>

					{/* Tags Filter */}
					<div className="space-y-2">
						<label className="text-sm text-gray-300">Tags</label>
						<select
							className="bg-[#2a2a2a] border border-gray-700 rounded-md px-3 py-1 text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5bc6ca]"
							value={selectedTag}
							onChange={(e) => setSelectedTag(e.target.value)}
							disabled={loading}
						>
							<option value="all">All Tags</option>
							{allTags.map((tag: string) => (
								<option key={tag} value={tag}>
									{tag}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Loading State */}
			{loading && (
				<div className="flex items-center justify-center py-20">
					<Loader2 className="animate-spin text-[#5bc6ca]" size={40} />
					<span className="ml-3 text-gray-400">Loading problems...</span>
				</div>
			)}

			{/* Empty State */}
			{!loading && problems.length === 0 && (
				<div className="flex flex-col items-center justify-center py-20 text-gray-400">
					<Code size={48} className="mb-4 opacity-50" />
					<p className="text-lg">No problems available</p>
					<p className="text-sm mt-2">Check back later for new challenges</p>
				</div>
			)}

			{/* Problem List */}
			{!loading && problems.length > 0 && (
				<div className="space-y-3">
					<h3 className="text-lg font-medium">
						{filteredProblems.length}{" "}
						{filteredProblems.length === 1 ? "Problem" : "Problems"} Found
					</h3>

					<div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
						{filteredProblems.length === 0 ? (
							<div className="text-center py-10 text-gray-400">
								No problems match your search criteria
							</div>
						) : (
							filteredProblems.map((problem: Problem) => (
								<div
									key={problem.id}
									className={`p-4 rounded-lg border transition-all cursor-pointer ${
										selectedProblem?.id === problem.id
											? "border-[#5bc6ca] bg-[#5bc6ca10]"
											: "border-gray-700 bg-[#2a2a2a] hover:border-gray-500"
									}`}
									onClick={() => setSelectedProblem(problem)}
								>
									<div className="flex justify-between items-start">
										<div className="flex items-center gap-3 flex-1">
											<Code
												size={20}
												className="text-[#5bc6ca] flex-shrink-0"
											/>
											<div className="flex-1 min-w-0">
												<h4 className="font-medium text-white">
													{problem.title}
												</h4>
												<p className="text-sm text-gray-400 mt-1 line-clamp-2">
													{problem.description}
												</p>
											</div>
										</div>
										<span
											className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2 ${difficultyBadgeColor(
												problem.difficulty
											)}`}
										>
											{problem.difficulty}
										</span>
									</div>

									{/* Tags and Stats */}
									<div className="mt-3 flex flex-wrap items-center justify-between gap-2">
										<div className="flex flex-wrap gap-2">
											{(problem.tags || []).slice(0, 3).map((tag: string) => (
												<span
													key={tag}
													className="text-xs bg-[#3a3a3a] text-gray-300 px-2 py-1 rounded-full"
												>
													{tag}
												</span>
											))}
											{(problem.tags || []).length > 3 && (
												<span className="text-xs bg-[#3a3a3a] text-gray-300 px-2 py-1 rounded-full">
													+{(problem.tags || []).length - 3} more
												</span>
											)}
										</div>

										<div className="flex items-center gap-3 text-sm">
											<div className="flex items-center text-yellow-400">
												<Star size={14} className="mr-1" fill="currentColor" />
												<span>{problem.rating.toFixed(1)}</span>
											</div>
											<div className="text-gray-400">
												{problem.default_time_limit} min
											</div>
										</div>
									</div>

									{/* Selection Indicator */}
									{selectedProblem?.id === problem.id && (
										<div className="mt-3 pt-3 border-t border-gray-700">
											<div className="flex items-center text-[#5bc6ca] text-sm">
												<svg
													className="w-4 h-4 mr-2"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
														clipRule="evenodd"
													/>
												</svg>
												Selected - Click Next to continue
											</div>
										</div>
									)}
								</div>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default SelectLeetCodeProblemStep;
