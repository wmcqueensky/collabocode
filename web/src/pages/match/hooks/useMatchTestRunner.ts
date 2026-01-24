import { useState, useCallback } from "react";
import { executeCode } from "../../../services/judge0Service";
import { DEFAULT_OUTPUT } from "../constants";
import type { TestCase, OutputLine } from "../types";

interface UseMatchTestRunnerProps {
	code: string;
	language: string;
	onTestComplete?: (passedCount: number, totalCount: number) => void;
	onActivityLog?: (
		type: "passed" | "failed" | "ran",
		message: string,
	) => Promise<void>;
}

interface UseMatchTestRunnerReturn {
	testCases: TestCase[];
	output: OutputLine[];
	setTestCases: (testCases: TestCase[]) => void;
	runTest: (testIndex: number | "all") => Promise<void>;
	runAllTests: () => Promise<{
		passedCount: number;
		totalCount: number;
		results: boolean[];
	}>;
}

export const useMatchTestRunner = ({
	code,
	language,
	onTestComplete,
	onActivityLog,
}: UseMatchTestRunnerProps): UseMatchTestRunnerReturn => {
	const [testCases, setTestCases] = useState<TestCase[]>([]);
	const [output, setOutput] = useState<OutputLine[]>(DEFAULT_OUTPUT);

	// Run all tests and return results (for submission)
	const runAllTests = useCallback(async () => {
		const results = await Promise.all(
			testCases.map(async (testCase) => {
				try {
					const result = await executeCode(
						code,
						language,
						JSON.stringify(testCase.input),
					);

					return (
						result.status === "success" &&
						result.output?.trim() === JSON.stringify(testCase.output)
					);
				} catch (error) {
					console.error("Error executing test case:", error);
					return false;
				}
			}),
		);

		const passedCount = results.filter((r) => r).length;

		return {
			passedCount,
			totalCount: results.length,
			results,
		};
	}, [testCases, code, language]);

	// Run test cases
	const runTest = useCallback(
		async (testIndex: number | "all") => {
			setOutput([{ message: "Running tests...", status: "normal" }]);

			try {
				if (testIndex === "all") {
					const results = await Promise.all(
						testCases.map(async (testCase) => {
							const result = await executeCode(
								code,
								language,
								JSON.stringify(testCase.input),
							);

							return {
								...testCase,
								result: result.output?.trim() || "",
								status:
									result.status === "success" &&
									result.output?.trim() === JSON.stringify(testCase.output)
										? ("pass" as const)
										: ("fail" as const),
							};
						}),
					);

					setTestCases(results);

					const newOutput = results.flatMap((result, index) => [
						{ message: `Running test case ${index + 1}...`, status: "normal" },
						{
							message:
								result.status === "pass"
									? `✓ Test case ${index + 1} passed`
									: `✗ Test case ${index + 1} failed`,
							status: result.status,
						},
					]);

					const passedCount = results.filter((r) => r.status === "pass").length;
					newOutput.push({
						message: `${passedCount}/${results.length} test cases passed`,
						status: passedCount === results.length ? "pass" : "fail",
					});

					setOutput(newOutput);

					onTestComplete?.(passedCount, results.length);

					await onActivityLog?.(
						"ran",
						`You ran all test cases (${passedCount}/${results.length} passed)`,
					);
				} else {
					const testCase = testCases[testIndex];

					const result = await executeCode(
						code,
						language,
						JSON.stringify(testCase.input),
					);

					const passed =
						result.status === "success" &&
						result.output?.trim() === JSON.stringify(testCase.output);

					const updatedTestCases = [...testCases];
					updatedTestCases[testIndex] = {
						...testCase,
						result: result.output?.trim() || "",
						status: passed ? "pass" : "fail",
					};

					setTestCases(updatedTestCases);

					setOutput([
						{
							message: `Running test case ${testIndex + 1}...`,
							status: "normal",
						},
						{
							message: passed
								? `✓ Test case ${testIndex + 1} passed`
								: `✗ Test case ${testIndex + 1} failed`,
							status: passed ? "pass" : "fail",
						},
					]);

					const passedCount = updatedTestCases.filter(
						(tc) => tc.status === "pass",
					).length;
					const totalCount = updatedTestCases.length;

					onTestComplete?.(passedCount, totalCount);

					if (passed) {
						await onActivityLog?.(
							"passed",
							`You passed Test Case ${testIndex + 1}`,
						);
					} else {
						await onActivityLog?.(
							"failed",
							`You failed Test Case ${testIndex + 1}`,
						);
					}
				}
			} catch (error: any) {
				console.error("Error running tests:", error);
				setOutput([
					{ message: "Error running tests", status: "fail" },
					{ message: error.message || "Unknown error", status: "fail" },
				]);
			}
		},
		[testCases, code, language, onTestComplete, onActivityLog],
	);

	return {
		testCases,
		output,
		setTestCases,
		runTest,
		runAllTests,
	};
};
