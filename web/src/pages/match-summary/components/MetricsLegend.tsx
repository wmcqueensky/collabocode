import { Award, Clock, CheckCircle, Zap, Code, Trophy } from "lucide-react";

export default function MetricsLegend() {
	return (
		<div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
			<h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
				<Award className="mr-2 text-sky-600" size={20} />
				Understanding the Metrics
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
				<div className="flex items-start gap-2">
					<Clock size={16} className="text-sky-600 mt-0.5 flex-shrink-0" />
					<div>
						<span className="text-gray-700 font-medium">Time:</span>
						<span className="text-gray-500 ml-1">
							How long it took to submit the solution (MM:SS format)
						</span>
					</div>
				</div>
				<div className="flex items-start gap-2">
					<CheckCircle
						size={16}
						className="text-sky-600 mt-0.5 flex-shrink-0"
					/>
					<div>
						<span className="text-gray-700 font-medium">Tests Passed:</span>
						<span className="text-gray-500 ml-1">
							Number of test cases successfully passed
						</span>
					</div>
				</div>
				<div className="flex items-start gap-2">
					<Zap size={16} className="text-sky-600 mt-0.5 flex-shrink-0" />
					<div>
						<span className="text-gray-700 font-medium">Time Complexity:</span>
						<span className="text-gray-500 ml-1">
							Big-O notation for algorithm efficiency (e.g., O(n), O(log n))
						</span>
					</div>
				</div>
				<div className="flex items-start gap-2">
					<Code size={16} className="text-sky-600 mt-0.5 flex-shrink-0" />
					<div>
						<span className="text-gray-700 font-medium">Space Complexity:</span>
						<span className="text-gray-500 ml-1">
							Memory usage of the algorithm (e.g., O(1), O(n))
						</span>
					</div>
				</div>
				<div className="flex items-start gap-2">
					<Trophy size={16} className="text-sky-600 mt-0.5 flex-shrink-0" />
					<div>
						<span className="text-gray-700 font-medium">Rating Change:</span>
						<span className="text-gray-500 ml-1">
							ELO rating points gained or lost based on performance
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
