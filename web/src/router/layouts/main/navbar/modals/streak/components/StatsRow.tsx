import { Flame, Zap, TrendingUp } from "lucide-react";
import type { StatsRowProps } from "../types";

export const StatsRow = ({
	streak,
	activeDaysThisMonth,
	consistencyRate,
}: StatsRowProps) => {
	return (
		<div className="grid grid-cols-3 gap-3 mb-6">
			<div className="bg-[#1a1a1a] rounded-xl p-3 text-center border border-gray-700">
				<Flame size={20} className="mx-auto text-orange-500 mb-1" />
				<p className="text-xl font-bold text-white">{streak}</p>
				<p className="text-xs text-gray-500">Current</p>
			</div>
			<div className="bg-[#1a1a1a] rounded-xl p-3 text-center border border-gray-700">
				<Zap size={20} className="mx-auto text-yellow-500 mb-1" />
				<p className="text-xl font-bold text-white">{activeDaysThisMonth}</p>
				<p className="text-xs text-gray-500">Active Days</p>
			</div>
			<div className="bg-[#1a1a1a] rounded-xl p-3 text-center border border-gray-700">
				<TrendingUp size={20} className="mx-auto text-green-500 mb-1" />
				<p className="text-xl font-bold text-white">{consistencyRate}%</p>
				<p className="text-xs text-gray-500">Consistency</p>
			</div>
		</div>
	);
};
