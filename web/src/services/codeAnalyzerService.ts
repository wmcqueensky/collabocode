/**
 * Code Complexity Analyzer Service
 * Analyzes code snapshots to estimate time and space complexity
 */

interface ComplexityResult {
	timeComplexity: string;
	spaceComplexity: string;
	confidence: "high" | "medium" | "low" | "none";
	reason?: string;
}

// Pattern-based complexity detection
interface ComplexityPattern {
	pattern: RegExp;
	timeComplexity: string;
	spaceComplexity: string;
	priority: number; // Higher priority patterns override lower ones
}

const JAVASCRIPT_PATTERNS: ComplexityPattern[] = [
	// O(n²) patterns - nested loops
	{
		pattern: /for\s*\([^)]*\)[^{}]*\{[^}]*for\s*\([^)]*\)/s,
		timeComplexity: "O(n²)",
		spaceComplexity: "O(1)",
		priority: 10,
	},
	{
		pattern: /while\s*\([^)]*\)[^{}]*\{[^}]*while\s*\([^)]*\)/s,
		timeComplexity: "O(n²)",
		spaceComplexity: "O(1)",
		priority: 10,
	},
	{
		pattern: /\.forEach\([^)]*\)[^{}]*\{[^}]*\.forEach\(/s,
		timeComplexity: "O(n²)",
		spaceComplexity: "O(1)",
		priority: 10,
	},
	// O(n log n) patterns - sorting
	{
		pattern: /\.sort\s*\(/,
		timeComplexity: "O(n log n)",
		spaceComplexity: "O(n)",
		priority: 8,
	},
	// O(n) patterns with O(n) space - using Map/Set/Object for lookup
	{
		pattern: /new\s+Map\s*\(/,
		timeComplexity: "O(n)",
		spaceComplexity: "O(n)",
		priority: 7,
	},
	{
		pattern: /new\s+Set\s*\(/,
		timeComplexity: "O(n)",
		spaceComplexity: "O(n)",
		priority: 7,
	},
	{
		pattern: /\{\s*\}|Object\.create/,
		timeComplexity: "O(n)",
		spaceComplexity: "O(n)",
		priority: 5,
	},
	// O(n) patterns - single loop
	{
		pattern: /for\s*\([^)]*\)/,
		timeComplexity: "O(n)",
		spaceComplexity: "O(1)",
		priority: 6,
	},
	{
		pattern: /while\s*\([^)]*\)/,
		timeComplexity: "O(n)",
		spaceComplexity: "O(1)",
		priority: 6,
	},
	{
		pattern: /\.forEach\s*\(/,
		timeComplexity: "O(n)",
		spaceComplexity: "O(1)",
		priority: 6,
	},
	{
		pattern: /\.map\s*\(/,
		timeComplexity: "O(n)",
		spaceComplexity: "O(n)",
		priority: 6,
	},
	{
		pattern: /\.filter\s*\(/,
		timeComplexity: "O(n)",
		spaceComplexity: "O(n)",
		priority: 6,
	},
	{
		pattern: /\.reduce\s*\(/,
		timeComplexity: "O(n)",
		spaceComplexity: "O(1)",
		priority: 6,
	},
	// O(log n) patterns - binary search
	{
		pattern: /mid\s*=.*Math\.floor.*\/\s*2|>>>?\s*1/,
		timeComplexity: "O(log n)",
		spaceComplexity: "O(1)",
		priority: 9,
	},
	// Recursive patterns (could be various complexities)
	{
		pattern: /function\s+(\w+)[^{]*\{[^}]*\1\s*\(/s,
		timeComplexity: "O(2^n)",
		spaceComplexity: "O(n)",
		priority: 4,
	},
];

const PYTHON_PATTERNS: ComplexityPattern[] = [
	// O(n²) patterns - nested loops
	{
		pattern: /for\s+\w+\s+in[^:]*:[^#\n]*\n[^#\n]*for\s+\w+\s+in/s,
		timeComplexity: "O(n²)",
		spaceComplexity: "O(1)",
		priority: 10,
	},
	// O(n log n) patterns - sorting
	{
		pattern: /\.sort\s*\(|sorted\s*\(/,
		timeComplexity: "O(n log n)",
		spaceComplexity: "O(n)",
		priority: 8,
	},
	// O(n) with O(n) space - using dict/set
	{
		pattern: /dict\s*\(|\{\s*\}|defaultdict/,
		timeComplexity: "O(n)",
		spaceComplexity: "O(n)",
		priority: 7,
	},
	{
		pattern: /set\s*\(/,
		timeComplexity: "O(n)",
		spaceComplexity: "O(n)",
		priority: 7,
	},
	// O(n) patterns - single loop
	{
		pattern: /for\s+\w+\s+in/,
		timeComplexity: "O(n)",
		spaceComplexity: "O(1)",
		priority: 6,
	},
	{
		pattern: /while\s+/,
		timeComplexity: "O(n)",
		spaceComplexity: "O(1)",
		priority: 6,
	},
	// List comprehension
	{
		pattern: /\[\s*\w+\s+for\s+\w+\s+in/,
		timeComplexity: "O(n)",
		spaceComplexity: "O(n)",
		priority: 6,
	},
];

export const codeAnalyzerService = {
	/**
	 * Analyze code complexity for a given code snippet
	 */
	analyzeComplexity(
		code: string | null | undefined,
		language: string
	): ComplexityResult {
		// Handle empty or invalid code
		if (!code || typeof code !== "string") {
			return {
				timeComplexity: "N/A",
				spaceComplexity: "N/A",
				confidence: "none",
				reason: "No code provided",
			};
		}

		const trimmedCode = code.trim();

		// Check if code is essentially empty (just a function signature)
		if (this.isEmptyOrStubCode(trimmedCode, language)) {
			return {
				timeComplexity: "N/A",
				spaceComplexity: "N/A",
				confidence: "none",
				reason: "Empty or stub code",
			};
		}

		// Check if code has syntax errors (basic check)
		if (this.hasObviousSyntaxErrors(trimmedCode, language)) {
			return {
				timeComplexity: "N/A",
				spaceComplexity: "N/A",
				confidence: "none",
				reason: "Code appears to have syntax errors",
			};
		}

		// Select patterns based on language
		const patterns = this.getPatternsForLanguage(language);

		// Find matching patterns and get highest priority match
		const matches = patterns
			.filter((p) => p.pattern.test(trimmedCode))
			.sort((a, b) => b.priority - a.priority);

		if (matches.length === 0) {
			// Default to O(1) if no patterns match (simple code)
			return {
				timeComplexity: "O(1)",
				spaceComplexity: "O(1)",
				confidence: "low",
				reason: "No recognizable patterns found",
			};
		}

		// Use highest priority match
		const bestMatch = matches[0];

		// Adjust space complexity if we detect array/object creation
		let spaceComplexity = bestMatch.spaceComplexity;
		if (this.detectsNewArrayOrObject(trimmedCode, language)) {
			if (spaceComplexity === "O(1)") {
				spaceComplexity = "O(n)";
			}
		}

		return {
			timeComplexity: bestMatch.timeComplexity,
			spaceComplexity: spaceComplexity,
			confidence: matches.length > 1 ? "medium" : "high",
		};
	},

	/**
	 * Check if code is empty or just a stub
	 */
	isEmptyOrStubCode(code: string, language: string): boolean {
		// Remove comments
		let cleanCode = code;
		if (language === "javascript" || language === "typescript") {
			cleanCode = code
				.replace(/\/\/.*$/gm, "") // Single line comments
				.replace(/\/\*[\s\S]*?\*\//g, ""); // Multi-line comments
		} else if (language === "python") {
			cleanCode = code
				.replace(/#.*$/gm, "") // Single line comments
				.replace(/"""[\s\S]*?"""/g, "") // Triple-quoted strings
				.replace(/'''[\s\S]*?'''/g, "");
		}

		// Check for common stub patterns
		const stubPatterns = [
			/function\s+\w+\s*\([^)]*\)\s*\{\s*\/\/\s*Your code here\s*\}/i,
			/function\s+\w+\s*\([^)]*\)\s*\{\s*\}/,
			/def\s+\w+\s*\([^)]*\)\s*:\s*pass/i,
			/def\s+\w+\s*\([^)]*\)\s*:\s*#\s*Your code here/i,
			/return\s*;?\s*$/,
			/pass\s*$/,
		];

		// Check if it's essentially just a function declaration with no logic
		const codeWithoutWhitespace = cleanCode.replace(/\s+/g, " ").trim();
		const hasMinimalContent = codeWithoutWhitespace.length < 100;
		const hasNoLogic =
			!codeWithoutWhitespace.includes("if") &&
			!codeWithoutWhitespace.includes("for") &&
			!codeWithoutWhitespace.includes("while") &&
			!codeWithoutWhitespace.includes("return ") &&
			!codeWithoutWhitespace.includes("return[") &&
			!codeWithoutWhitespace.includes("return{");

		if (hasMinimalContent && hasNoLogic) {
			return true;
		}

		return stubPatterns.some((pattern) => pattern.test(cleanCode));
	},

	/**
	 * Basic syntax error detection
	 */
	hasObviousSyntaxErrors(code: string, language: string): boolean {
		if (language === "javascript" || language === "typescript") {
			// Check for unbalanced braces
			const openBraces = (code.match(/\{/g) || []).length;
			const closeBraces = (code.match(/\}/g) || []).length;
			if (openBraces !== closeBraces) return true;

			// Check for unbalanced parentheses
			const openParens = (code.match(/\(/g) || []).length;
			const closeParens = (code.match(/\)/g) || []).length;
			if (openParens !== closeParens) return true;

			// Check for unbalanced brackets
			const openBrackets = (code.match(/\[/g) || []).length;
			const closeBrackets = (code.match(/\]/g) || []).length;
			if (openBrackets !== closeBrackets) return true;
		}

		if (language === "python") {
			// Check for unbalanced parentheses
			const openParens = (code.match(/\(/g) || []).length;
			const closeParens = (code.match(/\)/g) || []).length;
			if (openParens !== closeParens) return true;

			// Check for unbalanced brackets
			const openBrackets = (code.match(/\[/g) || []).length;
			const closeBrackets = (code.match(/\]/g) || []).length;
			if (openBrackets !== closeBrackets) return true;
		}

		return false;
	},

	/**
	 * Get complexity patterns for a specific language
	 */
	getPatternsForLanguage(language: string): ComplexityPattern[] {
		switch (language.toLowerCase()) {
			case "javascript":
			case "typescript":
				return JAVASCRIPT_PATTERNS;
			case "python":
				return PYTHON_PATTERNS;
			default:
				// Use JavaScript patterns as fallback for similar languages
				return JAVASCRIPT_PATTERNS;
		}
	},

	/**
	 * Detect if code creates new arrays or objects that scale with input
	 */
	detectsNewArrayOrObject(code: string, language: string): boolean {
		const patterns =
			language === "python"
				? [/\[\s*\]/, /\{\s*\}/, /list\s*\(/, /dict\s*\(/, /set\s*\(/]
				: [/\[\s*\]/, /\{\s*\}/, /new\s+Array/, /new\s+Object/];

		return patterns.some((p) => p.test(code));
	},

	/**
	 * Analyze multiple code snippets and return results
	 */
	analyzeMultiple(
		submissions: Array<{
			userId: string;
			code: string | null;
			language: string;
		}>
	): Map<string, ComplexityResult> {
		const results = new Map<string, ComplexityResult>();

		for (const submission of submissions) {
			const analysis = this.analyzeComplexity(
				submission.code,
				submission.language
			);
			results.set(submission.userId, analysis);
		}

		return results;
	},
};
