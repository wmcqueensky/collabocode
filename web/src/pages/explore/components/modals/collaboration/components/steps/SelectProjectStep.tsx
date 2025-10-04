import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import ProjectCard from "../ProjectCard";

type SelectProjectStepProps = {
	selectedProblem: any;
	setSelectedProblem: (p: any) => void;
	problems: any[];
};

const SelectProjectStep = ({
	selectedProblem,
	setSelectedProblem,
	problems,
}: SelectProjectStepProps) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [difficultyFilter, setDifficultyFilter] = useState("all");
	const [technologyFilter, setTechnologyFilter] = useState("all");

	// Filter problems based on search and filters
	const filteredProblems = problems.filter((problem: any) => {
		// Search filter
		const matchesSearch =
			searchQuery === "" ||
			problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			problem.description.toLowerCase().includes(searchQuery.toLowerCase());

		// Difficulty filter
		const matchesDifficulty =
			difficultyFilter === "all" || problem.difficulty === difficultyFilter;

		// Technology filter
		const matchesTechnology =
			technologyFilter === "all" ||
			problem.technologies.some(
				(tech: any) => tech.toLowerCase() === technologyFilter.toLowerCase()
			);

		return matchesSearch && matchesDifficulty && matchesTechnology;
	});

	return (
		<div className="p-6">
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
						className="w-full bg-[#232323] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#5bc6ca] text-gray-200"
					/>
				</div>
				<div className="flex gap-3">
					<div className="relative">
						<select
							value={difficultyFilter}
							onChange={(e) => setDifficultyFilter(e.target.value)}
							className="appearance-none bg-[#232323] border border-gray-700 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:border-[#5bc6ca] text-gray-200"
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
					<div className="relative">
						<select
							value={technologyFilter}
							onChange={(e) => setTechnologyFilter(e.target.value)}
							className="appearance-none bg-[#232323] border border-gray-700 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:border-[#5bc6ca] text-gray-200"
						>
							<option value="all">All Technologies</option>
							<option value="React">React</option>
							<option value="Redux">Redux</option>
							<option value="Node.js">Node.js</option>
							<option value="Spring Boot">Spring Boot</option>
							<option value="Django">Django</option>
							<option value="Firebase">Firebase</option>
						</select>
						<ChevronDown
							size={14}
							className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
						/>
					</div>
				</div>
			</div>

			{/* Project List */}
			<div className="grid gap-4">
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
						<p>No projects match your search criteria.</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default SelectProjectStep;
