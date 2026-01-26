import { PlayCircle, Check, X, Clock } from "lucide-react";

export const TestCases = ({ testCases, runTest, isMobile = false }: any) => {
	return (
		<div
			className={`space-y-3 sm:space-y-4 text-gray-700 ${
				isMobile ? "text-sm" : ""
			}`}
		>
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
				<h2
					className={`${
						isMobile ? "text-base" : "text-lg"
					} font-medium text-gray-900`}
				>
					Test Cases
				</h2>
				<button
					className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded text-xs sm:text-sm flex items-center justify-center space-x-1 w-full sm:w-auto transition"
					onClick={() => runTest("all")}
				>
					<PlayCircle size={isMobile ? 12 : 14} />
					<span>Run All</span>
				</button>
			</div>
			<div className="space-y-2 sm:space-y-3">
				{testCases.map((test: any, index: any) => (
					<div
						key={index}
						className={`border rounded-md overflow-hidden ${
							test.status === "pass"
								? "border-purple-300"
								: test.status === "fail"
									? "border-red-300"
									: "border-gray-200"
						}`}
					>
						<div className="flex items-center justify-between px-2 sm:px-3 py-2 bg-gray-50 border-b border-gray-200">
							<div
								className={`font-medium ${
									isMobile ? "text-xs" : "text-sm"
								} text-gray-700 flex-1`}
							>
								Test Case {index + 1}
							</div>
							<div className="flex items-center space-x-2">
								<button
									className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-0.5 rounded whitespace-nowrap transition"
									onClick={() => runTest(index)}
								>
									Run
								</button>
								{test.status === "pass" && (
									<Check
										size={isMobile ? 14 : 16}
										className="text-purple-600"
									/>
								)}
								{test.status === "fail" && (
									<X size={isMobile ? 14 : 16} className="text-red-500" />
								)}
								{test.status === "pending" && (
									<Clock size={isMobile ? 14 : 16} className="text-gray-400" />
								)}
							</div>
						</div>
						<div
							className={`p-2 sm:p-3 ${
								isMobile ? "text-xs" : "text-sm"
							} space-y-2 bg-white`}
						>
							<div className="break-words">
								<strong>Input:</strong>
								<span className="ml-1 font-mono">
									{typeof test.input === "object"
										? JSON.stringify(test.input)
										: test.input}
								</span>
							</div>
							<div className="break-words">
								<strong>Expected:</strong>
								<span className="ml-1 font-mono">
									{typeof test.output === "object"
										? JSON.stringify(test.output)
										: test.output}
								</span>
							</div>
							{test.result && (
								<div className="break-words">
									<strong>Output:</strong>
									<span className="ml-1 font-mono">
										{typeof test.result === "object"
											? JSON.stringify(test.result)
											: test.result}
									</span>
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
