import { Tag, Clock } from "lucide-react";

type SelectedProjectCardProps = {
	problem: {
		title: string;
		difficulty?: string;
		estimatedTime?: string;
		technologies?: string[];
	};
};

const SelectedProjectCard = ({ problem }: SelectedProjectCardProps) => {
	const difficulty = problem?.difficulty ?? "unknown";
	const difficultyLabel =
		typeof difficulty === "string"
			? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
			: String(difficulty);

	return (
		<div className="bg-[#232323] border border-gray-700 rounded-lg p-4">
			<div className="flex justify-between items-start mb-2">
				<h4 className="font-medium text-white">{problem?.title}</h4>
				<div
					className={`px-2 py-1 rounded text-xs font-medium ${
						difficulty === "easy"
							? "bg-green-900/30 text-green-400"
							: difficulty === "medium"
							? "bg-yellow-900/30 text-yellow-400"
							: "bg-red-900/30 text-red-400"
					}`}
				>
					{difficultyLabel}
				</div>
			</div>
			<div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
				<div className="flex items-center">
					<Clock size={12} className="mr-1" />
					{problem?.estimatedTime ?? "—"}
				</div>
				<div className="flex items-center">
					<Tag size={12} className="mr-1" />
					{(problem?.technologies ?? []).join(", ") || "—"}
				</div>
			</div>
		</div>
	);
};

export default SelectedProjectCard;
