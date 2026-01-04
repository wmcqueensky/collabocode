import { useState } from "react";
import { Search, ChevronDown, Code, Clock } from "lucide-react";

type SelectProjectStepProps = {
	selectedProblem: any;
	setSelectedProblem: (p: any) => void;
	problems: any[];
};

// Project Card for collaboration
const ProjectCard = ({
	problem,
	isSelected,
	onClick,
}: {
	problem: any;
	isSelected?: boolean;
	onClick?: () => void;
}) => {
	return (
		<div
			onClick={onClick}
			className={`bg-[#232323] border rounded-lg p-4 cursor-pointer transition-all ${
				isSelected
					? "border-purple-500 ring-1 ring-purple-500"
					: "border-gray-700 hover:border-gray-500"
			}`}
		>
			<div className="flex justify-between items-start mb-2">
				<h3 className="font-medium text-white">{problem.title}</h3>
				<div
					className={`px-2 py-1 rounded text-xs font-medium ${
						problem.difficulty === "easy"
							? "bg-green-900/30 text-green-400"
							: problem.difficulty === "medium"
							? "bg-yellow-900/30 text-yellow-400"
							: "bg-red-900/30 text-red-400"
					}`}
				>
					{problem.difficulty?.charAt(0).toUpperCase() +
						problem.difficulty?.slice(1)}
				</div>
			</div>
			<p className="text-sm text-gray-400 mb-3 line-clamp-2">
				{problem.description}
			</p>
			<div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
				<div className="flex items-center">
					<Clock size={12} className="mr-1" />
					{problem.estimated_time || 30} min
				</div>
				<div className="flex items-center">
					<Code size={12} className="mr-1" />
					{problem.category || "React"}
				</div>
				<div className="flex flex-wrap gap-1 ml-auto">
					{(problem.tags || []).slice(0, 3).map((tag: string, i: number) => (
						<span
							key={i}
							className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded"
						>
							{tag}
						</span>
					))}
				</div>
			</div>
		</div>
	);
};

const SelectProjectStep = ({
	selectedProblem,
	setSelectedProblem,
	problems,
}: SelectProjectStepProps) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [difficultyFilter, setDifficultyFilter] = useState("all");

	// Filter problems:
	// 1. Only show collaboration type problems
	// 2. Apply search filter
	// 3. Apply difficulty filter
	const filteredProblems = problems.filter((problem: any) => {
		// Only show collaboration type problems
		if (problem.type !== "collaboration") {
			return false;
		}

		// Search filter
		const matchesSearch =
			searchQuery === "" ||
			problem.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			problem.description?.toLowerCase().includes(searchQuery.toLowerCase());

		// Difficulty filter
		const matchesDifficulty =
			difficultyFilter === "all" || problem.difficulty === difficultyFilter;

		return matchesSearch && matchesDifficulty;
	});

	return (
		<div className="p-6">
			{/* Header */}
			<div className="mb-6">
				<h3 className="text-lg font-medium text-white mb-2">
					Select a Collaboration Project
				</h3>
				<p className="text-sm text-gray-400">
					These projects are designed for pair programming and team
					collaboration. Each project includes multiple files with TODOs for
					collaborators to work on together.
				</p>
			</div>

			{/* Search and Filters */}
			<div className="flex flex-col md:flex-row gap-4 mb-6">
				<div className="flex-1 relative">
					<Search
						size={16}
						className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
					/>
					<input
						type="text"
						placeholder="Search projects..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full bg-[#232323] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500 text-gray-200"
					/>
				</div>
				<div className="flex gap-3">
					<div className="relative">
						<select
							value={difficultyFilter}
							onChange={(e) => setDifficultyFilter(e.target.value)}
							className="appearance-none bg-[#232323] border border-gray-700 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:border-purple-500 text-gray-200"
						>
							<option value="all">All Difficulties</option>
							<option value="easy">Easy</option>
							<option value="medium">Medium</option>
							<option value="hard">Hard</option>
						</select>
						<ChevronDown
							size={14}
							className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
						/>
					</div>
				</div>
			</div>

			{/* Project List */}
			<div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
				{filteredProblems.length > 0 ? (
					filteredProblems.map((problem: any) => (
						<ProjectCard
							key={problem.id}
							problem={problem}
							isSelected={selectedProblem?.id === problem.id}
							onClick={() => setSelectedProblem(problem)}
						/>
					))
				) : (
					<div className="text-center py-10 text-gray-400">
						<Code size={48} className="mx-auto mb-4 opacity-50" />
						<p>No collaboration projects found.</p>
						<p className="text-sm mt-2">
							Try adjusting your search or filters.
						</p>
					</div>
				)}
			</div>

			{/* Info Box */}
			<div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
				<h4 className="font-medium text-purple-400 mb-2">
					💡 About Collaboration Projects
				</h4>
				<ul className="text-sm text-gray-300 space-y-1">
					<li>
						• Projects include multiple React/TypeScript files with pre-defined
						structure
					</li>
					<li>
						• TODOs are distributed across files for collaborators to work on
					</li>
					<li>
						• Real-time sync allows everyone to see changes as they happen
					</li>
					<li>• The codebase is fixed - no adding or removing files</li>
				</ul>
			</div>
		</div>
	);
};

export default SelectProjectStep;
