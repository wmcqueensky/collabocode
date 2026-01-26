import { useState } from "react";
import { Search, Code, Loader2 } from "lucide-react";
import type { Problem } from "../../../../../../../types/database";
import type { SelectLeetCodeProblemStepProps } from "../../types";
import { getDifficultyBadgeColor } from "../../constants";

// Accent colors for competition modal (sky blue)
const ACCENT = {
	bg: "bg-sky-600",
	bgLight: "bg-sky-100",
	text: "text-sky-600",
	border: "border-sky-600",
	ring: "ring-sky-600",
	focus: "focus:border-sky-600 focus:ring-sky-600",
};

const SelectLeetCodeProblemStep = ({
	selectedProblem,
	setSelectedProblem,
	problems,
	loading = false,
}: SelectLeetCodeProblemStepProps) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

	// Filter problems based on search and filters
	const filteredProblems = problems.filter((problem: Problem) => {
		const matchesSearch =
			searchQuery === "" ||
			problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			problem.description?.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesDifficulty =
			difficultyFilter === "all" ||
			problem.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

		return matchesSearch && matchesDifficulty;
	});

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 size={32} className={`${ACCENT.text} animate-spin`} />
			</div>
		);
	}

	return (
		<div className="p-4 sm:p-6">
			{/* Header */}
			<div className="mb-6">
				<h3 className="text-lg font-medium text-gray-900 mb-2">
					Select a LeetCode Problem
				</h3>
				<p className="text-sm text-gray-600">
					Choose a coding problem to compete on with other players.
				</p>
			</div>

			{/* Search and Filters */}
			<div className="flex flex-col sm:flex-row gap-3 mb-6">
				<div className="flex-1 relative">
					<Search
						size={16}
						className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
					/>
					<input
						type="text"
						placeholder="Search problems..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className={`w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none ${ACCENT.focus}`}
					/>
				</div>
				<div className="flex gap-2">
					{["all", "easy", "medium", "hard"].map((diff) => (
						<button
							key={diff}
							onClick={() => setDifficultyFilter(diff)}
							className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
								difficultyFilter === diff
									? `${ACCENT.bg} text-white`
									: "bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-300"
							}`}
						>
							{diff.charAt(0).toUpperCase() + diff.slice(1)}
						</button>
					))}
				</div>
			</div>

			{/* Problem List */}
			<div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
				{filteredProblems.length > 0 ? (
					filteredProblems.map((problem: Problem) => (
						<div
							key={problem.id}
							onClick={() => setSelectedProblem(problem)}
							className={`bg-white border rounded-lg p-4 cursor-pointer transition-all ${
								selectedProblem?.id === problem.id
									? `${ACCENT.border} ring-1 ${ACCENT.ring}`
									: "border-gray-200 hover:border-gray-400"
							}`}
						>
							<div className="flex justify-between items-start mb-2">
								<h4 className="font-medium text-gray-900">{problem.title}</h4>
								<span
									className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyBadgeColor(
										problem.difficulty,
									)}`}
								>
									{problem.difficulty}
								</span>
							</div>
							{problem.description && (
								<p className="text-sm text-gray-600 line-clamp-2 mb-3">
									{problem.description}
								</p>
							)}
							{problem.tags && problem.tags.length > 0 && (
								<div className="flex flex-wrap gap-1.5">
									{problem.tags.slice(0, 4).map((tag: string, i: number) => (
										<span
											key={i}
											className={`px-2 py-0.5 ${ACCENT.bgLight} ${ACCENT.text} rounded text-xs`}
										>
											{tag}
										</span>
									))}
									{problem.tags.length > 4 && (
										<span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
											+{problem.tags.length - 4} more
										</span>
									)}
								</div>
							)}
						</div>
					))
				) : (
					<div className="text-center py-10 text-gray-500">
						<Code size={48} className="mx-auto mb-4 opacity-50" />
						<p>No problems found.</p>
						<p className="text-sm mt-2">
							Try adjusting your search or filters.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default SelectLeetCodeProblemStep;
