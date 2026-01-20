import { Trophy, User, Award, Clock } from "lucide-react";
import type { SummaryData } from "../utils/types";

interface SuccessBannerProps {
	summaryData: SummaryData;
}

export default function SuccessBanner({ summaryData }: SuccessBannerProps) {
	return (
		<div className="bg-gradient-to-r from-[#5bc6ca]/20 to-[#48aeb3]/20 border border-[#5bc6ca]/30 rounded-lg p-6 mb-8 text-center shadow-lg">
			<div className="flex justify-center mb-4">
				<Trophy size={48} className="text-[#5bc6ca]" />
			</div>
			<h2 className="text-2xl font-bold mb-2">Match Complete!</h2>
			<p className="text-lg text-gray-300">
				Problem:{" "}
				<span className="font-semibold text-[#5bc6ca]">
					{summaryData.problemName}
				</span>{" "}
				({summaryData.difficulty})
			</p>
			<div className="mt-4 flex justify-center items-center gap-4 flex-wrap">
				<div className="flex items-center">
					<User className="text-[#5bc6ca] mr-1" size={20} />
					<span>{summaryData.totalParticipants} Players</span>
				</div>
				<div className="flex items-center">
					<Award className="text-[#5bc6ca] mr-1" size={20} />
					<span>Winner: {summaryData.winner}</span>
				</div>
				{summaryData.winnerTime && summaryData.winnerTime !== "N/A" && (
					<div className="flex items-center">
						<Clock className="text-[#5bc6ca] mr-1" size={20} />
						<span>Best Time: {summaryData.winnerTime}</span>
					</div>
				)}
			</div>
		</div>
	);
}
