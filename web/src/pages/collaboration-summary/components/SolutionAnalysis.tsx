import { Clock, Zap, Timer, BarChart3 } from "lucide-react";
import type { TeamEvaluation } from "../utils/types";
import { formatTime } from "../utils/utils";

interface SolutionAnalysisProps {
	teamEvaluation: TeamEvaluation;
}

export default function SolutionAnalysis({
	teamEvaluation,
}: SolutionAnalysisProps) {
	return (
		<div className="bg-[#2c2c2c] rounded-lg p-6 mb-6 border border-gray-700">
			<h3 className="text-xl font-semibold mb-4 flex items-center">
				<BarChart3 className="mr-2 text-purple-500" size={20} />
				Solution Analysis
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="text-center p-4 bg-[#1f1f1f] rounded-lg">
					<Clock className="mx-auto mb-2 text-blue-400" size={24} />
					<div className="text-2xl font-bold text-blue-400">
						{teamEvaluation.complexity.timeComplexity}
					</div>
					<div className="text-sm text-gray-400">Time Complexity</div>
					{teamEvaluation.complexity.confidence !== "none" && (
						<div className="text-xs text-gray-500 mt-1">
							Confidence: {teamEvaluation.complexity.confidence}
						</div>
					)}
				</div>

				<div className="text-center p-4 bg-[#1f1f1f] rounded-lg">
					<Zap className="mx-auto mb-2 text-yellow-400" size={24} />
					<div className="text-2xl font-bold text-yellow-400">
						{teamEvaluation.complexity.spaceComplexity}
					</div>
					<div className="text-sm text-gray-400">Space Complexity</div>
				</div>

				<div className="text-center p-4 bg-[#1f1f1f] rounded-lg">
					<Timer className="mx-auto mb-2 text-green-400" size={24} />
					<div className="text-2xl font-bold text-green-400">
						{formatTime(teamEvaluation.solveTimeSeconds)}
					</div>
					<div className="text-sm text-gray-400">Solve Time</div>
					{teamEvaluation.percentiles && (
						<div className="text-xs text-gray-500 mt-1">
							Avg: {formatTime(teamEvaluation.percentiles.averageSolveTime)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
