import type { Problem } from "../../../types/database";

export const ProblemDescription = ({
	isMobile = false,
	problem,
}: {
	isMobile?: boolean;
	problem?: Problem;
}) => {
	if (!problem) {
		return (
			<div className="flex items-center justify-center h-64 text-gray-500">
				Loading problem...
			</div>
		);
	}

	// Get difficulty color
	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty.toLowerCase()) {
			case "easy":
				return "bg-green-100 text-green-700";
			case "medium":
				return "bg-yellow-100 text-yellow-700";
			case "hard":
				return "bg-red-100 text-red-700";
			default:
				return "bg-gray-100 text-gray-600";
		}
	};

	return (
		<div
			className={`space-y-3 sm:space-y-4 text-gray-700 ${
				isMobile ? "text-sm" : ""
			}`}
		>
			<h2
				className={`${
					isMobile ? "text-lg" : "text-xl"
				} font-medium text-gray-900`}
			>
				{problem.title}
			</h2>

			{/* Tags */}
			<div className="flex flex-wrap gap-2">
				<span
					className={`px-2 py-0.5 rounded text-xs ${getDifficultyColor(
						problem.difficulty,
					)}`}
				>
					{problem.difficulty}
				</span>
				{problem.tags.map((tag, index) => (
					<span
						key={index}
						className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs"
					>
						{tag}
					</span>
				))}
			</div>

			{/* Description */}
			<div
				className={`${
					isMobile ? "text-xs" : "text-sm"
				} leading-relaxed space-y-3`}
				dangerouslySetInnerHTML={{
					__html: formatDescription(problem.description),
				}}
			/>

			{/* Test Cases as Examples */}
			{problem.test_cases && problem.test_cases.length > 0 && (
				<div className="space-y-3">
					<h3
						className={`font-medium text-gray-900 ${
							isMobile ? "text-sm" : "text-base"
						}`}
					>
						Examples:
					</h3>
					{problem.test_cases
						.slice(0, 2)
						.map((testCase: any, index: number) => (
							<div
								key={index}
								className={`bg-gray-50 p-2 sm:p-3 rounded-md ${
									isMobile ? "text-xs" : "text-sm"
								} space-y-1 border border-gray-200`}
							>
								<p>
									<strong>Input:</strong>{" "}
									<code className="bg-gray-200 px-1 rounded">
										{JSON.stringify(testCase.input)}
									</code>
								</p>
								<p>
									<strong>Output:</strong>{" "}
									<code className="bg-gray-200 px-1 rounded">
										{JSON.stringify(testCase.output)}
									</code>
								</p>
							</div>
						))}
				</div>
			)}

			{/* Additional Info */}
			<div className="space-y-2 pt-4 border-t border-gray-200">
				<h3
					className={`font-medium text-gray-900 ${
						isMobile ? "text-sm" : "text-base"
					}`}
				>
					Your Task:
				</h3>
				<p className={`${isMobile ? "text-xs" : "text-sm"} leading-relaxed`}>
					Work together with your team to implement a solution that passes all
					test cases. You can run individual test cases or all of them at once
					to validate your solution.
				</p>
			</div>
		</div>
	);
};

// Helper function to format description with better HTML
function formatDescription(description: string): string {
	// Convert newlines to paragraphs
	const paragraphs = description.split("\n\n").filter((p) => p.trim());

	return paragraphs
		.map((p) => {
			// Handle code blocks
			if (p.includes("```")) {
				return p.replace(
					/```(\w+)?\n([\s\S]*?)```/g,
					'<pre class="bg-gray-100 p-3 rounded-md overflow-x-auto border border-gray-200"><code>$2</code></pre>',
				);
			}

			// Handle inline code
			p = p.replace(
				/`([^`]+)`/g,
				'<code class="bg-gray-200 px-1 rounded">$1</code>',
			);

			// Handle bold
			p = p.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

			return `<p>${p}</p>`;
		})
		.join("");
}
