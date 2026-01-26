import { Clock, Code } from "lucide-react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Cell,
} from "recharts";
import type { PlayerData } from "../utils/types";

interface PerformanceChartsProps {
	players: PlayerData[];
}

export default function PerformanceCharts({ players }: PerformanceChartsProps) {
	// Prepare time performance data with indicator colors (green = fast, red = slow)
	const timePerformanceData = players
		.filter((p) => p.timeToSolve > 0)
		.map((player) => ({
			name: player.name,
			time: player.timeToSolve,
			formattedTime: player.formattedTime,
			fill:
				player.timeToSolve <= 180 // 3 minutes - excellent
					? "#22c55e"
					: player.timeToSolve <= 300 // 5 minutes - good
						? "#eab308"
						: player.timeToSolve <= 600 // 10 minutes - okay
							? "#f97316"
							: "#ef4444", // slow
		}))
		.sort((a, b) => a.time - b.time);

	// Prepare code quality data with indicator colors
	const codeQualityData = players
		.map((player) => ({
			name: player.name,
			score: player.codeQualityScore,
			fill:
				player.codeQualityScore >= 100
					? "#22c55e"
					: player.codeQualityScore >= 75
						? "#eab308"
						: player.codeQualityScore >= 50
							? "#f97316"
							: "#ef4444",
		}))
		.sort((a, b) => b.score - a.score);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
			{/* Time Performance Chart */}
			<div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
				<h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
					<Clock className="mr-2 text-sky-600" size={20} />
					Solution Time
				</h3>
				<div className="h-64">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={timePerformanceData}
							layout="vertical"
							margin={{ top: 5, right: 30, left: 70, bottom: 10 }}
						>
							<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
							<XAxis
								type="number"
								stroke="#6b7280"
								domain={[0, "auto"]}
								label={{
									value: "Time (seconds)",
									position: "insideBottom",
									offset: -5,
									fill: "#6b7280",
								}}
							/>
							<YAxis dataKey="name" type="category" stroke="#6b7280" />
							<Tooltip
								contentStyle={{
									backgroundColor: "#ffffff",
									borderColor: "#0ea5e9",
									color: "#111827",
								}}
								formatter={(value, _name) => {
									const entry = timePerformanceData.find(
										(d) => d.time === value,
									);
									return [entry?.formattedTime || value, "Time"];
								}}
							/>
							<Bar dataKey="time" name="Time" radius={[0, 4, 4, 0]}>
								{timePerformanceData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.fill} />
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Test Pass Rate Chart */}
			<div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
				<h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
					<Code className="mr-2 text-sky-600" size={20} />
					Test Pass Rate
				</h3>
				<div className="h-64">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={codeQualityData}
							layout="vertical"
							margin={{ top: 5, right: 30, left: 70, bottom: 10 }}
						>
							<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
							<XAxis
								type="number"
								stroke="#6b7280"
								domain={[0, 100]}
								label={{
									value: "Pass Rate %",
									position: "insideBottom",
									offset: -5,
									fill: "#6b7280",
								}}
							/>
							<YAxis dataKey="name" type="category" stroke="#6b7280" />
							<Tooltip
								contentStyle={{
									backgroundColor: "#ffffff",
									borderColor: "#0ea5e9",
									color: "#111827",
								}}
								formatter={(value) => [`${value}%`, "Pass Rate"]}
							/>
							<Bar dataKey="score" name="Pass Rate" radius={[0, 4, 4, 0]}>
								{codeQualityData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.fill} />
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
}
