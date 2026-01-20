import type { ComplexityAnalysis } from "./types";
import { getComplexityScore } from "./utils";

/**
 * Calculate efficiency score from complexity analysis
 */
export const calculateEfficiencyScore = (
	complexity: ComplexityAnalysis,
): number => {
	if (complexity.confidence === "none") {
		return 50;
	}
	return getComplexityScore(complexity);
};

/**
 * Calculate code quality score from actual code analysis
 */
export const calculateCodeQualityScore = (
	code: string,
	language: string,
): number => {
	if (!code || code.trim().length === 0) return 0;

	let score = 50;
	const lines = code.split("\n");
	const nonEmptyLines = lines.filter((l) => l.trim().length > 0);

	const hasComments =
		language === "python"
			? code.includes("#") || code.includes('"""') || code.includes("'''")
			: code.includes("//") || code.includes("/*");
	if (hasComments) score += 15;

	const varPattern =
		language === "python"
			? /(?:^|\s)(\w+)\s*=/gm
			: /(?:let|const|var)\s+(\w+)/g;
	const matches = [...code.matchAll(varPattern)];
	if (matches.length > 0) {
		const avgLength =
			matches.reduce((sum, m) => sum + (m[1]?.length || 0), 0) / matches.length;
		if (avgLength > 5) score += 15;
		else if (avgLength > 3) score += 8;
	}

	const hasIndentation = nonEmptyLines.some(
		(l) => l.startsWith("  ") || l.startsWith("\t"),
	);
	if (hasIndentation) score += 10;

	if (nonEmptyLines.length >= 5 && nonEmptyLines.length <= 100) score += 5;

	const hasFunctions =
		language === "python"
			? /def\s+\w+\s*\(/.test(code)
			: /function\s+\w+\s*\(|const\s+\w+\s*=\s*(?:async\s*)?\(/.test(code);
	if (hasFunctions) score += 5;

	return Math.min(100, Math.max(0, score));
};

/**
 * Calculate collaboration score from actual participation metrics
 */
export const calculateCollaborationScore = (
	participants: any[],
	session: any,
): number => {
	if (participants.length === 0) return 0;

	let score = 0;
	const totalParticipants = participants.length;

	const submittedCount = participants.filter((p) => p.submission_time).length;
	const submissionRate = submittedCount / totalParticipants;
	score += submissionRate * 40;

	const submissions = participants
		.filter((p) => p.submission_time)
		.map((p) => new Date(p.submission_time).getTime());

	if (submissions.length >= 2) {
		const minTime = Math.min(...submissions);
		const maxTime = Math.max(...submissions);
		const spreadMs = maxTime - minTime;
		const spreadMinutes = spreadMs / (1000 * 60);

		if (spreadMinutes < 5) score += 30;
		else if (spreadMinutes < 15) score += 20;
		else if (spreadMinutes < 30) score += 10;
	} else if (submissions.length === 1) {
		score += 15;
	}

	const expectedPlayers = session.max_players || 2;
	const utilizationRate = totalParticipants / expectedPlayers;
	score += utilizationRate * 30;

	return Math.min(100, Math.max(0, Math.round(score)));
};

/**
 * Calculate overall score with dynamic weighting
 */
export const calculateOverallScore = (
	correctness: number,
	efficiency: number,
	codeQuality: number,
	collaboration: number,
	isCorrect: boolean,
): number => {
	const correctnessWeight = isCorrect ? 0.4 : 0.5;
	const efficiencyWeight = isCorrect ? 0.25 : 0.15;
	const qualityWeight = 0.15;
	const collaborationWeight = isCorrect ? 0.2 : 0.2;

	return Math.round(
		correctness * correctnessWeight +
			efficiency * efficiencyWeight +
			codeQuality * qualityWeight +
			collaboration * collaborationWeight,
	);
};
