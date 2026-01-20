import { Star, TrendingUp, CheckCircle, Lightbulb } from "lucide-react";
import type { TeamEvaluation } from "../utils/types";

interface FeedbackSectionsProps {
	teamEvaluation: TeamEvaluation;
}

export default function FeedbackSections({
	teamEvaluation,
}: FeedbackSectionsProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
			<div className="bg-[#2c2c2c] rounded-lg p-6 border border-gray-700">
				<h3 className="text-lg font-semibold mb-4 flex items-center text-green-400">
					<Star className="mr-2" size={20} />
					Team Strengths
				</h3>
				<ul className="space-y-2">
					{teamEvaluation.strengths.map((strength, index) => (
						<li key={index} className="flex items-start space-x-2">
							<CheckCircle
								size={16}
								className="text-green-400 mt-1 flex-shrink-0"
							/>
							<span className="text-gray-300">{strength}</span>
						</li>
					))}
				</ul>
			</div>

			<div className="bg-[#2c2c2c] rounded-lg p-6 border border-gray-700">
				<h3 className="text-lg font-semibold mb-4 flex items-center text-yellow-400">
					<TrendingUp className="mr-2" size={20} />
					Areas to Improve
				</h3>
				<ul className="space-y-2">
					{teamEvaluation.improvements.map((improvement, index) => (
						<li key={index} className="flex items-start space-x-2">
							<Lightbulb
								size={16}
								className="text-yellow-400 mt-1 flex-shrink-0"
							/>
							<span className="text-gray-300">{improvement}</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
