import { Award, Clock, CheckCircle, Zap, Code, Trophy } from "lucide-react";

export default function MetricsLegend() {
	return (
		<div className="bg-[#2c2c2c] rounded-lg p-6 shadow-md border border-gray-700">
			<h3 className="text-lg font-semibold mb-4 flex items-center">
				<Award className="mr-2 text-[#5bc6ca]" size={20} />
				Understanding the Metrics
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
				<div className="flex items-start gap-2">
					<Clock size={16} className="text-[#5bc6ca] mt-0.5 flex-shrink-0" />
					<div>
						<span className="text-gray-300 font-medium">Time:</span>
						<span className="text-gray-400 ml-1">
							How long it took to submit the solution (MM:SS format)
						</span>
					</div>
				</div>
				<div className="flex items-start gap-2">
					<CheckCircle
						size={16}
						className="text-[#5bc6ca] mt-0.5 flex-shrink-0"
					/>
					<div>
						<span className="text-gray-300 font-medium">Tests Passed:</span>
						<span className="text-gray-400 ml-1">
							Number of test cases successfully passed
						</span>
					</div>
				</div>
				<div className="flex items-start gap-2">
					<Zap size={16} className="text-[#5bc6ca] mt-0.5 flex-shrink-0" />
					<div>
						<span className="text-gray-300 font-medium">Time Complexity:</span>
						<span className="text-gray-400 ml-1">
							Big-O notation for algorithm efficiency (e.g., O(n), O(log n))
						</span>
					</div>
				</div>
				<div className="flex items-start gap-2">
					<Code size={16} className="text-[#5bc6ca] mt-0.5 flex-shrink-0" />
					<div>
						<span className="text-gray-300 font-medium">Space Complexity:</span>
						<span className="text-gray-400 ml-1">
							Memory usage of the algorithm (e.g., O(1), O(n))
						</span>
					</div>
				</div>
				<div className="flex items-start gap-2">
					<Trophy size={16} className="text-[#5bc6ca] mt-0.5 flex-shrink-0" />
					<div>
						<span className="text-gray-300 font-medium">Rating Change:</span>
						<span className="text-gray-400 ml-1">
							ELO rating points gained or lost based on performance
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
