import { Target, Timer, Zap, BarChart3, Lightbulb } from "lucide-react";
import type { DistributionData } from "../utils/types";
import {
	formatTime,
	getComplexityBarColor,
	getSpaceComplexityBarColor,
} from "../utils/helpers";

interface DistributionChartsProps {
	distributionData: DistributionData;
	winnerTime: string;
	winnerTimeComplexity: string;
	winnerSpaceComplexity: string;
}

export default function DistributionCharts({
	distributionData,
	winnerTime,
	winnerTimeComplexity,
	winnerSpaceComplexity,
}: DistributionChartsProps) {
	const hasData =
		distributionData.timeDistribution.some((d) => d.count > 0) ||
		distributionData.complexityDistribution.some((d) => d.count > 0);

	if (!hasData) {
		return null;
	}

	return (
		<div className="bg-[#2c2c2c] rounded-lg p-6 mb-6 border border-gray-700">
			<h3 className="text-xl font-semibold mb-4 flex items-center">
				<Target className="mr-2 text-[#5bc6ca]" size={20} />
				How This Match Compares to Others
			</h3>

			<p className="text-sm text-gray-400 mb-6">
				Compared against {distributionData.totalComparisons} winning solution
				{distributionData.totalComparisons !== 1 ? "s" : ""} from previous
				matches on this problem
			</p>

			{/* Runtime Distribution Chart */}
			<RuntimeDistributionChart
				timeDistribution={distributionData.timeDistribution}
				timePercentile={distributionData.timePercentile}
				winnerTime={winnerTime}
				averageSolveTime={distributionData.averageSolveTime}
			/>

			{/* Time & Space Complexity Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
				<TimeComplexityChart
					complexityDistribution={distributionData.complexityDistribution}
					complexityPercentile={distributionData.complexityPercentile}
					winnerTimeComplexity={winnerTimeComplexity}
				/>
				<SpaceComplexityChart
					spaceComplexityDistribution={
						distributionData.spaceComplexityDistribution
					}
					winnerSpaceComplexity={winnerSpaceComplexity}
				/>
			</div>

			{/* Percentile Summary with Legends */}
			<PercentileSummary distributionData={distributionData} />
		</div>
	);
}

interface RuntimeDistributionChartProps {
	timeDistribution: DistributionData["timeDistribution"];
	timePercentile: number;
	winnerTime: string;
	averageSolveTime: number;
}

function RuntimeDistributionChart({
	timeDistribution,
	timePercentile,
	winnerTime,
	averageSolveTime,
}: RuntimeDistributionChartProps) {
	return (
		<div className="bg-[#1f1f1f] rounded-lg p-4 mb-4">
			<div className="flex items-center justify-between mb-4">
				<h4 className="text-sm font-medium text-gray-300 flex items-center">
					<Timer size={16} className="mr-2 text-[#5bc6ca]" />
					Runtime Distribution
				</h4>
				<span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
					Beats {timePercentile}%
				</span>
			</div>

			<div className="space-y-2">
				{timeDistribution.map((bucket, idx) => {
					const maxCount = Math.max(...timeDistribution.map((d) => d.count), 1);
					const width =
						bucket.count > 0 ? Math.max((bucket.count / maxCount) * 100, 8) : 0;

					return (
						<div key={idx} className="flex items-center gap-2">
							<span className="text-xs text-gray-500 w-16 text-right font-mono">
								{bucket.range}
							</span>
							<div className="flex-1 h-6 bg-[#2a2a2a] rounded overflow-hidden relative">
								<div
									className={`h-full rounded transition-all duration-500 ${
										bucket.isYours
											? "bg-gradient-to-r from-green-500 to-green-400"
											: "bg-gray-600"
									}`}
									style={{ width: `${width}%` }}
								/>
								{bucket.isYours && (
									<div className="absolute inset-0 flex items-center justify-end pr-2">
										<span className="text-xs font-bold text-white drop-shadow-lg">
											Winner
										</span>
									</div>
								)}
							</div>
							<span className="text-xs text-gray-500 w-8 font-mono">
								{bucket.count}
							</span>
						</div>
					);
				})}
			</div>

			<div className="mt-4 pt-3 border-t border-gray-700">
				<div className="flex justify-between text-xs text-gray-500">
					<span>
						Winner's time:{" "}
						<span className="text-green-400 font-medium">{winnerTime}</span>
					</span>
					<span>Avg: {formatTime(averageSolveTime)}</span>
				</div>
			</div>
		</div>
	);
}

interface TimeComplexityChartProps {
	complexityDistribution: DistributionData["complexityDistribution"];
	complexityPercentile: number;
	winnerTimeComplexity: string;
}

function TimeComplexityChart({
	complexityDistribution,
	complexityPercentile,
	winnerTimeComplexity,
}: TimeComplexityChartProps) {
	return (
		<div className="bg-[#1f1f1f] rounded-lg p-4">
			<div className="flex items-center justify-between mb-4">
				<h4 className="text-sm font-medium text-gray-300 flex items-center">
					<Zap size={16} className="mr-2 text-blue-400" />
					Time Complexity Distribution
				</h4>
				<span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
					Beats {complexityPercentile}%
				</span>
			</div>

			<div className="space-y-2">
				{complexityDistribution.map((bucket, idx) => {
					const maxCount = Math.max(
						...complexityDistribution.map((d) => d.count),
						1,
					);
					const width =
						bucket.count > 0 ? Math.max((bucket.count / maxCount) * 100, 8) : 0;

					return (
						<div key={idx} className="flex items-center gap-2">
							<span className="text-xs text-gray-500 w-20 text-right font-mono">
								{bucket.complexity}
							</span>
							<div className="flex-1 h-6 bg-[#2a2a2a] rounded overflow-hidden relative">
								<div
									className={`h-full rounded transition-all duration-500 ${getComplexityBarColor(
										bucket.complexity,
										bucket.isYours,
									)}`}
									style={{ width: `${width}%` }}
								/>
								{bucket.isYours && (
									<div className="absolute inset-0 flex items-center justify-end pr-2">
										<span className="text-xs font-bold text-white drop-shadow-lg">
											Winner
										</span>
									</div>
								)}
							</div>
							<span className="text-xs text-gray-500 w-8 font-mono">
								{bucket.count}
							</span>
						</div>
					);
				})}
			</div>

			<div className="mt-4 pt-3 border-t border-gray-700">
				<div className="text-xs text-gray-500">
					Winner's complexity:{" "}
					<span className="text-blue-400 font-medium">
						{winnerTimeComplexity}
					</span>
				</div>
			</div>
		</div>
	);
}

interface SpaceComplexityChartProps {
	spaceComplexityDistribution: DistributionData["spaceComplexityDistribution"];
	winnerSpaceComplexity: string;
}

function SpaceComplexityChart({
	spaceComplexityDistribution,
	winnerSpaceComplexity,
}: SpaceComplexityChartProps) {
	return (
		<div className="bg-[#1f1f1f] rounded-lg p-4">
			<div className="flex items-center justify-between mb-4">
				<h4 className="text-sm font-medium text-gray-300 flex items-center">
					<BarChart3 size={16} className="mr-2 text-purple-400" />
					Space Complexity Distribution
				</h4>
			</div>

			<div className="space-y-2">
				{spaceComplexityDistribution.map((bucket, idx) => {
					const maxCount = Math.max(
						...spaceComplexityDistribution.map((d) => d.count),
						1,
					);
					const width =
						bucket.count > 0 ? Math.max((bucket.count / maxCount) * 100, 8) : 0;

					return (
						<div key={idx} className="flex items-center gap-2">
							<span className="text-xs text-gray-500 w-20 text-right font-mono">
								{bucket.complexity}
							</span>
							<div className="flex-1 h-6 bg-[#2a2a2a] rounded overflow-hidden relative">
								<div
									className={`h-full rounded transition-all duration-500 ${getSpaceComplexityBarColor(
										bucket.complexity,
										bucket.isYours,
									)}`}
									style={{ width: `${width}%` }}
								/>
								{bucket.isYours && (
									<div className="absolute inset-0 flex items-center justify-end pr-2">
										<span className="text-xs font-bold text-white drop-shadow-lg">
											Winner
										</span>
									</div>
								)}
							</div>
							<span className="text-xs text-gray-500 w-8 font-mono">
								{bucket.count}
							</span>
						</div>
					);
				})}
			</div>

			<div className="mt-4 pt-3 border-t border-gray-700">
				<div className="text-xs text-gray-500">
					Winner's complexity:{" "}
					<span className="text-purple-400 font-medium">
						{winnerSpaceComplexity}
					</span>
				</div>
			</div>
		</div>
	);
}

interface PercentileSummaryProps {
	distributionData: DistributionData;
}

function PercentileSummary({ distributionData }: PercentileSummaryProps) {
	return (
		<div className="bg-[#1f1f1f] rounded-lg p-4">
			<h4 className="text-sm font-medium text-gray-300 mb-4">
				Performance Summary
			</h4>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				<div className="bg-[#2a2a2a] rounded-lg p-3 text-center">
					<div className="text-2xl font-bold text-green-400">
						{distributionData.timePercentile}%
					</div>
					<div className="text-xs text-gray-500">Runtime Percentile</div>
				</div>
				<div className="bg-[#2a2a2a] rounded-lg p-3 text-center">
					<div className="text-2xl font-bold text-blue-400">
						{distributionData.complexityPercentile}%
					</div>
					<div className="text-xs text-gray-500">Complexity Percentile</div>
				</div>
				<div className="bg-[#2a2a2a] rounded-lg p-3 text-center">
					<div className="text-2xl font-bold text-purple-400">
						{formatTime(distributionData.fastestSolveTime)}
					</div>
					<div className="text-xs text-gray-500">Fastest Ever</div>
				</div>
				<div className="bg-[#2a2a2a] rounded-lg p-3 text-center">
					<div className="text-2xl font-bold text-gray-400">
						{distributionData.totalComparisons}
					</div>
					<div className="text-xs text-gray-500">Total Matches</div>
				</div>
			</div>

			{/* Legend Section */}
			<div className="border-t border-gray-700 pt-4">
				<h5 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 flex items-center">
					<Lightbulb size={12} className="mr-1" />
					What These Metrics Mean
				</h5>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
					<div className="flex items-start gap-2 p-2 bg-[#2a2a2a] rounded">
						<div className="w-3 h-3 rounded-full bg-green-400 mt-0.5 flex-shrink-0" />
						<div>
							<span className="text-gray-300 font-medium">
								Runtime Percentile
							</span>
							<p className="text-gray-500 mt-0.5">
								The percentage of previous winning solutions that were slower.
								Higher is better.
							</p>
						</div>
					</div>
					<div className="flex items-start gap-2 p-2 bg-[#2a2a2a] rounded">
						<div className="w-3 h-3 rounded-full bg-blue-400 mt-0.5 flex-shrink-0" />
						<div>
							<span className="text-gray-300 font-medium">
								Complexity Percentile
							</span>
							<p className="text-gray-500 mt-0.5">
								The percentage of solutions with worse algorithmic efficiency.
								Higher means more optimal.
							</p>
						</div>
					</div>
					<div className="flex items-start gap-2 p-2 bg-[#2a2a2a] rounded">
						<div className="w-3 h-3 rounded-full bg-blue-400 mt-0.5 flex-shrink-0" />
						<div>
							<span className="text-gray-300 font-medium">Time Complexity</span>
							<p className="text-gray-500 mt-0.5">
								How runtime scales with input size. O(n) is linear, O(n²) is
								quadratic. Lower is better.
							</p>
						</div>
					</div>
					<div className="flex items-start gap-2 p-2 bg-[#2a2a2a] rounded">
						<div className="w-3 h-3 rounded-full bg-purple-400 mt-0.5 flex-shrink-0" />
						<div>
							<span className="text-gray-300 font-medium">
								Space Complexity
							</span>
							<p className="text-gray-500 mt-0.5">
								How memory usage scales with input. O(1) is constant, O(n) grows
								with input size.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Chart Legend */}
			<div className="border-t border-gray-700 pt-4 mt-4">
				<h5 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
					Chart Legend
				</h5>
				<div className="flex flex-wrap gap-4 text-xs">
					<div className="flex items-center gap-2">
						<div className="w-4 h-3 rounded bg-gradient-to-r from-green-500 to-green-400" />
						<span className="text-gray-400">Excellent (O(1), O(log n))</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-4 h-3 rounded bg-gradient-to-r from-yellow-500 to-yellow-400" />
						<span className="text-gray-400">Good (O(n), O(n log n))</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-4 h-3 rounded bg-gradient-to-r from-orange-500 to-orange-400" />
						<span className="text-gray-400">Fair (O(n²))</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-4 h-3 rounded bg-gradient-to-r from-red-500 to-red-400" />
						<span className="text-gray-400">Poor (O(n³), O(2^n))</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-4 h-3 rounded bg-gray-600" />
						<span className="text-gray-400">Previous matches</span>
					</div>
				</div>
			</div>
		</div>
	);
}
