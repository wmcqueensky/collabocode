import { Clock, Code } from "lucide-react";

type ProjectCardProps = {
	problem: {
		title: string;
		difficulty: string;
		description: string;
		estimatedTime?: string;
		languages?: string[];
		technologies?: string[];
	};
	isSelected?: boolean;
	onClick?: () => void;
};

const ProjectCard = ({ problem, isSelected, onClick }: ProjectCardProps) => {
	return (
		<div
			onClick={onClick}
			className={`bg-white border rounded-lg p-4 cursor-pointer transition-all ${
				isSelected
					? "border-purple-600 ring-1 ring-purple-600"
					: "border-gray-200 hover:border-gray-400"
			}`}
		>
			<div className="flex justify-between items-start mb-2">
				<h3 className="font-medium text-gray-900">{problem.title}</h3>
				<div
					className={`px-2 py-1 rounded text-xs font-medium ${
						problem.difficulty === "easy"
							? "bg-green-100 text-green-700"
							: problem.difficulty === "medium"
								? "bg-yellow-100 text-yellow-700"
								: "bg-red-100 text-red-700"
					}`}
				>
					{problem.difficulty.charAt(0).toUpperCase() +
						problem.difficulty.slice(1)}
				</div>
			</div>
			<p className="text-sm text-gray-600 mb-3">{problem.description}</p>
			<div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
				<div className="flex items-center">
					<Clock size={12} className="mr-1" />
					{problem.estimatedTime}
				</div>
				<div className="flex items-center">
					<Code size={12} className="mr-1" />
					{(problem.languages || []).join(", ")}
				</div>
				<div className="flex flex-wrap gap-1 ml-auto">
					{(problem.technologies || []).map((tech, i) => (
						<span key={i} className="px-1.5 py-0.5 bg-gray-100 rounded">
							{tech}
						</span>
					))}
				</div>
			</div>
		</div>
	);
};

export default ProjectCard;
