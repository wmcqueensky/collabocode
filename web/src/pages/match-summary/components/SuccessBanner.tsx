import { Trophy, User, Award, Clock } from "lucide-react";
import type { SummaryData } from "../utils/types";

interface SuccessBannerProps {
	summaryData: SummaryData;
}

export default function SuccessBanner({ summaryData }: SuccessBannerProps) {
	return (
		<div className="bg-sky-50 border border-sky-200 rounded-lg p-6 mb-8 text-center shadow-sm">
			<div className="flex justify-center mb-4">
				<Trophy size={48} className="text-sky-600" />
			</div>
			<h2 className="text-2xl font-bold mb-2 text-gray-900">Match Complete!</h2>
			<p className="text-lg text-gray-600">
				Problem:{" "}
				<span className="font-semibold text-sky-600">
					{summaryData.problemName}
				</span>{" "}
				({summaryData.difficulty})
			</p>
			<div className="mt-4 flex justify-center items-center gap-4 flex-wrap text-gray-700">
				<div className="flex items-center">
					<User className="text-sky-600 mr-1" size={20} />
					<span>{summaryData.totalParticipants} Players</span>
				</div>
				<div className="flex items-center">
					<Award className="text-sky-600 mr-1" size={20} />
					<span>Winner: {summaryData.winner}</span>
				</div>
				{summaryData.winnerTime && summaryData.winnerTime !== "N/A" && (
					<div className="flex items-center">
						<Clock className="text-sky-600 mr-1" size={20} />
						<span>Best Time: {summaryData.winnerTime}</span>
					</div>
				)}
			</div>
		</div>
	);
}
