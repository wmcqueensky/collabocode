import { useState } from "react";
import { Search, Code, Loader2 } from "lucide-react";
import type { Problem } from "../../../../../../../types/database";

type SelectProblemStepProps = {
	selectedProblem: Problem | null;
	setSelectedProblem: (problem: Problem | null) => void;
	problems: Problem[];
	loading?: boolean;
};

// Violet accent colors
const ACCENT = {
	bg: "bg-[#8b5cf6]",
	bgLight: "bg-[#8b5cf6]/20",
	text: "text-[#a78bfa]",
	border: "border-[#8b5cf6]",
	ring: "ring-[#8b5cf6]",
	focus: "focus:border-[#8b5cf6] focus:ring-[#8b5cf6]",
};

const SelectProblemStep = ({
	selectedProblem,
	setSelectedProblem,
	problems,
	loading = false,
}: SelectProblemStepProps) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

	// Filter problems
	const filteredProblems = problems.filter((problem) => {
		const matchesSearch =
			searchQuery === "" ||
			problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			problem.description?.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesDifficulty =
			difficultyFilter === "all" ||
			problem.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

		return matchesSearch && matchesDifficulty;
	});

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty.toLowerCase()) {
			case "easy":
				return "bg-green-500/20 text-green-400";
			case "medium":
				return "bg-yellow-500/20 text-yellow-400";
			case "hard":
				return "bg-red-500/20 text-red-400";
			default:
				return "bg-gray-500/20 text-gray-400";
		}
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
			{/* Header */}
			<div className="mb-6">
				<h3 className="text-lg font-medium text-white mb-2">
					Select a Problem
				</h3>
				<p className="text-sm text-gray-400">
					Choose a coding problem to solve together with your team.
				</p>
			</div>

			{/* Search and Filters */}
			<div className="flex flex-col sm:flex-row gap-3 mb-6">
				<div className="flex-1 relative">
					<Search
						size={16}
						className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
					/>
					<input
						type="text"
						placeholder="Search problems..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className={`w-full bg-[#2a2a2a] border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none ${ACCENT.focus}`}
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
									: "bg-[#2a2a2a] text-gray-400 hover:text-white border border-gray-700"
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
					filteredProblems.map((problem) => (
						<div
							key={problem.id}
							onClick={() => setSelectedProblem(problem)}
							className={`bg-[#2a2a2a] border rounded-lg p-4 cursor-pointer transition-all ${
								selectedProblem?.id === problem.id
									? `${ACCENT.border} ring-1 ${ACCENT.ring}`
									: "border-gray-700 hover:border-gray-500"
							}`}
						>
							<div className="flex justify-between items-start mb-2">
								<h4 className="font-medium text-white">{problem.title}</h4>
								<span
									className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(
										problem.difficulty
									)}`}
								>
									{problem.difficulty}
								</span>
							</div>
							{problem.description && (
								<p className="text-sm text-gray-400 line-clamp-2 mb-3">
									{problem.description}
								</p>
							)}
							{problem.tags && problem.tags.length > 0 && (
								<div className="flex flex-wrap gap-1.5">
									{problem.tags.slice(0, 4).map((tag, i) => (
										<span
											key={i}
											className={`px-2 py-0.5 ${ACCENT.bgLight} ${ACCENT.text} rounded text-xs`}
										>
											{tag}
										</span>
									))}
								</div>
							)}
						</div>
					))
				) : (
					<div className="text-center py-10 text-gray-400">
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

export default SelectProblemStep;
