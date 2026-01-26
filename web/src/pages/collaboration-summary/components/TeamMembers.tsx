import {
	Users,
	CheckCircle,
	Award,
	TrendingUp,
	TrendingDown,
} from "lucide-react";
import type { TeamMember } from "../utils/types";
import { getRatingChangeColor } from "../utils/utils";

interface TeamMembersProps {
	teamMembers: TeamMember[];
	currentUserId: string;
}

export default function TeamMembers({
	teamMembers,
	currentUserId,
}: TeamMembersProps) {
	return (
		<div className="bg-white rounded-lg p-6 mb-6 border border-gray-200 shadow-sm">
			<h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
				<Users className="mr-2 text-purple-500" size={20} />
				Team Members
			</h3>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{teamMembers.map((member, index) => (
					<div
						key={index}
						className={`flex items-center space-x-4 p-4 bg-gray-50 rounded-lg ${
							member.id === currentUserId ? "ring-2 ring-purple-500/50" : ""
						}`}
					>
						<div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg">
							{member.name.charAt(0).toUpperCase()}
						</div>
						<div className="flex-1">
							<div className="flex items-center justify-between">
								<p className="font-medium text-gray-900">
									{member.name}
									{member.id === currentUserId && (
										<span className="text-purple-600 text-xs ml-2">(You)</span>
									)}
								</p>
								<div
									className={`flex items-center ${getRatingChangeColor(
										member.ratingChange,
									)}`}
								>
									{member.ratingChange > 0 ? (
										<TrendingUp size={14} className="mr-1" />
									) : member.ratingChange < 0 ? (
										<TrendingDown size={14} className="mr-1" />
									) : null}
									<span className="font-bold">
										{member.ratingChange > 0 ? "+" : ""}
										{member.ratingChange}
									</span>
								</div>
							</div>
							<div className="flex items-center space-x-3 text-sm text-gray-500">
								<span className="flex items-center">
									<CheckCircle size={14} className="mr-1 text-green-500" />
									{member.passedTests}/{member.totalTests} tests
								</span>
								<span className="flex items-center">
									<Award size={14} className="mr-1" />
									{member.ratingBefore + member.ratingChange} ELO
								</span>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
