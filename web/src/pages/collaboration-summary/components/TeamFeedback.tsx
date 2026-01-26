import { Lightbulb } from "lucide-react";
import type { TeamEvaluation } from "../utils/types";

interface TeamFeedbackProps {
	teamEvaluation: TeamEvaluation;
}

export default function TeamFeedback({ teamEvaluation }: TeamFeedbackProps) {
	return (
		<div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
			<h3 className="text-lg font-semibold text-purple-600 mb-3 flex items-center">
				<Lightbulb className="mr-2" size={20} />
				Team Feedback
			</h3>
			<div className="space-y-2">
				{teamEvaluation.feedback.map((fb, index) => (
					<p key={index} className="text-gray-700">
						{fb}
					</p>
				))}
			</div>
		</div>
	);
}
