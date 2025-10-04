import { useState } from "react";
import { Code, Search, Star } from "lucide-react";

type SelectLeetCodeProblemStepProps = {
	selectedProblem: any;
	setSelectedProblem: (p: any) => void;
	problems: any[];
};

const SelectLeetCodeProblemStep = ({
	selectedProblem,
	setSelectedProblem,
	problems,
}: SelectLeetCodeProblemStepProps) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedDifficulty, setSelectedDifficulty] = useState("all");
	const [selectedTag, setSelectedTag] = useState("all");

	// Filter problems based on search and filters
	const filteredProblems = problems.filter((problem: any) => {
		const matchesSearch =
			searchQuery.trim() === "" ||
			problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			problem.description.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesDifficulty =
			selectedDifficulty === "all" || problem.difficulty === selectedDifficulty;

		const matchesTag =
			selectedTag === "all" ||
			(Array.isArray(problem.tags) && problem.tags.includes(selectedTag));

		return matchesSearch && matchesDifficulty && matchesTag;
	});

	// Get all unique tags from problems
	const allTags = Array.from(
		new Set(problems.flatMap((problem: any) => problem.tags || []))
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

			{/* Problem List */}
			<div className="space-y-3">
				<h3 className="text-lg font-medium">
					{filteredProblems.length}{" "}
					{filteredProblems.length === 1 ? "Problem" : "Problems"} Found
				</h3>

				<div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
					{filteredProblems.map((problem: any) => (
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
								<div className="flex items-center gap-3">
									<Code size={20} className="text-[#5bc6ca]" />
									<div>
										<h4 className="font-medium text-white">{problem.title}</h4>
										<p className="text-sm text-gray-400 mt-1 line-clamp-2">
											{problem.description}
										</p>
									</div>
								</div>
								<span
									className={`text-xs px-2 py-1 rounded-full ${difficultyBadgeColor(
										problem.difficulty
									)}`}
								>
									{problem.difficulty}
								</span>
							</div>

							{/* Tags and Stats */}
							<div className="mt-3 flex flex-wrap items-center justify-between">
								<div className="flex flex-wrap gap-2">
									{(problem.tags || []).slice(0, 3).map((tag: any) => (
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

								<div className="flex items-center text-yellow-400 text-sm">
									<Star size={14} className="mr-1" fill="currentColor" />
									<span>{problem.rating} Rating</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default SelectLeetCodeProblemStep;
