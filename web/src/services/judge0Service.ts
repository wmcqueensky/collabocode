const JUDGE0_API_URL =
	import.meta.env.VITE_JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = import.meta.env.VITE_JUDGE0_API_KEY;

// Language IDs for Judge0
const LANGUAGE_IDS: Record<string, number> = {
	javascript: 63, // Node.js
	python: 71, // Python 3
	java: 62, // Java
	cpp: 54, // C++ 17
	csharp: 51, // C#
	go: 60, // Go
	ruby: 72, // Ruby
	typescript: 74, // TypeScript
	php: 68, // PHP
	swift: 83, // Swift
	kotlin: 78, // Kotlin
	rust: 73, // Rust
};

interface CodeExecutionResult {
	status: "success" | "error" | "timeout" | "runtime_error";
	output?: string;
	error?: string;
	time?: number;
	memory?: number;
}

/**
 * Extract function name from code
 */
function extractFunctionName(code: string, language: string): string {
	if (language === "javascript") {
		const match = code.match(/function\s+(\w+)|const\s+(\w+)\s*=/);
		return match ? match[1] || match[2] : "solution";
	} else if (language === "python") {
		const match = code.match(/def\s+(\w+)/);
		return match ? match[1] : "solution";
	}
	return "solution";
}

/**
 * Wrap user code with test execution logic
 */
function wrapCodeForExecution(
	code: string,
	language: string,
	input: string
): string {
	const functionName = extractFunctionName(code, language);

	if (language === "javascript") {
		// Parse the input to get parameter names
		const testInput = JSON.parse(input);
		const params = Object.keys(testInput)
			.map((key) => `input.${key}`)
			.join(", ");

		// Wrap the user's function and call it with test input
		return `
${code}

// Execute the function with test input
const input = ${input};
const result = ${functionName}(${params});
console.log(JSON.stringify(result));
`;
	} else if (language === "python") {
		const testInput = JSON.parse(input);
		const params = Object.keys(testInput)
			.map((key) => `input_data['${key}']`)
			.join(", ");

		return `
${code}

# Execute the function with test input
import json
input_data = json.loads('${input}')
result = ${functionName}(${params})
print(json.dumps(result))
`;
	}

	// Add more language support as needed
	return code;
}

/**
 * Execute code using Judge0 API
 */
export async function executeCode(
	code: string,
	language: string,
	input?: string
): Promise<CodeExecutionResult> {
	try {
		const languageId = LANGUAGE_IDS[language.toLowerCase()];
		if (!languageId) {
			throw new Error(`Unsupported language: ${language}`);
		}

		// If no API key, use mock execution
		if (!JUDGE0_API_KEY) {
			console.warn("Judge0 API key not found, using mock execution");
			return mockExecuteCode(code, language, input);
		}

		// Wrap the code with test execution logic
		const wrappedCode = wrapCodeForExecution(code, language, input || "{}");

		// Step 1: Submit the code
		const submitResponse = await fetch(
			`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-RapidAPI-Key": JUDGE0_API_KEY,
					"X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
				},
				body: JSON.stringify({
					source_code: wrappedCode,
					language_id: languageId,
					stdin: "",
					cpu_time_limit: 2,
					memory_limit: 128000,
				}),
			}
		);

		if (!submitResponse.ok) {
			throw new Error(`Judge0 API error: ${submitResponse.status}`);
		}

		const result = await submitResponse.json();

		// Process the result
		if (result.status.id === 3) {
			// Accepted
			return {
				status: "success",
				output: result.stdout?.trim() || "",
				time: result.time,
				memory: result.memory,
			};
		} else if (result.status.id === 5) {
			// Time Limit Exceeded
			return {
				status: "timeout",
				error: "Time limit exceeded",
			};
		} else if (
			result.status.id === 6 ||
			result.status.id === 11 ||
			result.status.id === 12
		) {
			// Runtime Error, Compilation Error, etc.
			return {
				status: "runtime_error",
				error: result.stderr || result.compile_output || "Runtime error",
			};
		} else {
			// Other errors
			return {
				status: "error",
				error: result.stderr || `Status: ${result.status.description}`,
			};
		}
	} catch (error: any) {
		console.error("Code execution error:", error);
		return {
			status: "error",
			error: error.message || "Failed to execute code",
		};
	}
}

/**
 * Mock code execution for development/testing without Judge0 API
 */
function mockExecuteCode(
	code: string,
	language: string,
	input?: string
): CodeExecutionResult {
	console.log("Mock executing code:", { language, input });

	// Try to parse input
	let testInput: any;
	try {
		testInput = input ? JSON.parse(input) : null;
	} catch (e) {
		return {
			status: "error",
			error: "Invalid JSON input",
		};
	}

	// For Two Sum problem (mock solution)
	if (testInput && testInput.nums && testInput.target !== undefined) {
		// Try to execute the user's code
		try {
			// Create a safe execution context
			const twoSum = new Function(
				"nums",
				"target",
				`
${code}
return twoSum(nums, target);
			`
			);

			const result = twoSum(testInput.nums, testInput.target);
			return {
				status: "success",
				output: JSON.stringify(result),
				time: 0.001,
				memory: 1024,
			};
		} catch (error: any) {
			return {
				status: "runtime_error",
				error: error.message,
			};
		}
	}

	// Default mock response
	return {
		status: "success",
		output: JSON.stringify(testInput),
		time: 0.001,
		memory: 1024,
	};
}

/**
 * Validate test case output
 */
export function validateOutput(actual: string, expected: any): boolean {
	try {
		// Try to parse both as JSON
		const actualParsed = JSON.parse(actual);
		const expectedValue =
			typeof expected === "string" ? JSON.parse(expected) : expected;

		// Deep comparison
		return JSON.stringify(actualParsed) === JSON.stringify(expectedValue);
	} catch {
		// If not JSON, do string comparison
		return actual.trim() === String(expected).trim();
	}
}

/**
 * Get language name from ID
 */
export function getLanguageName(languageId: string): string {
	const names: Record<string, string> = {
		javascript: "JavaScript",
		python: "Python",
		java: "Java",
		cpp: "C++",
		csharp: "C#",
		go: "Go",
		ruby: "Ruby",
		typescript: "TypeScript",
		php: "PHP",
		swift: "Swift",
		kotlin: "Kotlin",
		rust: "Rust",
	};
	return names[languageId.toLowerCase()] || languageId;
}
