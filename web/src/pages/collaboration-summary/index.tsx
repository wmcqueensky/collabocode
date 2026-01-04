import { useState, useEffect } from "react";
import {
	ArrowLeft,
	CheckCircle,
	XCircle,
	Clock,
	Code,
	Users,
	AlertTriangle,
	Loader2,
	Rocket,
	Star,
	TrendingUp,
	Lightbulb,
	Award,
	Zap,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { sessionService } from "../../services/sessionService";
import { supabase } from "../../lib/supabase";

interface TeamMember {
	name: string;
	avatar: string | null;
	passedTests: number;
	totalTests: number;
	submissionTime: string;
}

interface TeamEvaluation {
	overallScore: number;
	correctness: number;
	efficiency: number;
	codeQuality: number;
	collaboration: number;
	feedback: string[];
	strengths: string[];
	improvements: string[];
}

export default function CollaborationSummaryPage() {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [session, setSession] = useState<any>(null);
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
	const [teamEvaluation, setTeamEvaluation] = useState<TeamEvaluation | null>(
		null
	);
	const [sharedCode, setSharedCode] = useState<string>("");

	useEffect(() => {
		if (!sessionId) {
			navigate("/explore");
			return;
		}

		loadCollaborationSummary();
	}, [sessionId]);

	const loadCollaborationSummary = async () => {
		try {
			setLoading(true);
			setError(null);

			// Load session
			const sessionData = await sessionService.getSessionById(sessionId!);
			if (!sessionData) {
				setError("Session not found");
				return;
			}

			// Redirect if wrong session type
			if (sessionData.type !== "collaboration") {
				navigate(`/match-summary/${sessionId}`);
				return;
			}

			// Check if session is completed
			if (sessionData.status !== "completed") {
				setError(
					"This collaboration is still in progress. You'll be notified when it's complete."
				);
				return;
			}

			setSession(sessionData);

			// Load participants
			const { data: participants, error: participantsError } = await supabase
				.from("session_participants")
				.select(`*, user:profiles(*)`)
				.eq("session_id", sessionId)
				.eq("status", "joined");

			if (participantsError) throw participantsError;

			// Map to team members
			const members: TeamMember[] = (participants || []).map((p: any) => {
				const testResults = p.test_results || {};
				return {
					name: p.user?.username || "Unknown",
					avatar: p.user?.avatar_url,
					passedTests: testResults.passedCount || 0,
					totalTests: testResults.totalCount || 0,
					submissionTime: p.submission_time
						? new Date(p.submission_time).toLocaleTimeString("en-US", {
								hour: "2-digit",
								minute: "2-digit",
						  })
						: "N/A",
				};
			});

			setTeamMembers(members);

			// Get the shared code (use first participant's code snapshot as they all edited the same document)
			const codeSnapshot = participants?.[0]?.code_snapshot || "";
			setSharedCode(codeSnapshot);

			// Calculate team evaluation
			const evaluation = calculateTeamEvaluation(
				participants || [],
				sessionData,
				codeSnapshot
			);
			setTeamEvaluation(evaluation);
		} catch (err: any) {
			console.error("Error loading collaboration summary:", err);
			setError("Failed to load collaboration summary");
		} finally {
			setLoading(false);
		}
	};

	// Calculate team evaluation based on the shared solution
	const calculateTeamEvaluation = (
		participants: any[],
		session: any,
		code: string
	): TeamEvaluation => {
		// Calculate correctness based on test results
		let totalPassed = 0;
		let totalTests = 0;
		participants.forEach((p) => {
			const results = p.test_results || {};
			totalPassed += results.passedCount || 0;
			totalTests += results.totalCount || 0;
		});

		const avgPassRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;
		const correctness = Math.round(avgPassRate);

		// Estimate efficiency based on code patterns (simplified)
		const efficiency = estimateEfficiency(code);

		// Estimate code quality
		const codeQuality = estimateCodeQuality(code);

		// Collaboration score (based on all members submitting)
		const allSubmitted = participants.every((p) => p.submission_time);
		const collaboration = allSubmitted ? 90 : 60;

		// Overall score (weighted average)
		const overallScore = Math.round(
			correctness * 0.4 +
				efficiency * 0.2 +
				codeQuality * 0.2 +
				collaboration * 0.2
		);

		// Generate feedback
		const feedback = generateFeedback(
			correctness,
			efficiency,
			codeQuality,
			collaboration
		);
		const strengths = generateStrengths(
			correctness,
			efficiency,
			codeQuality,
			collaboration
		);
		const improvements = generateImprovements(
			correctness,
			efficiency,
			codeQuality,
			collaboration
		);

		return {
			overallScore,
			correctness,
			efficiency,
			codeQuality,
			collaboration,
			feedback,
			strengths,
			improvements,
		};
	};

	// Estimate code efficiency (simplified heuristic)
	const estimateEfficiency = (code: string): number => {
		if (!code) return 50;

		let score = 70;

		// Check for nested loops (potential O(n²))
		const nestedLoopPattern = /for\s*\([^)]*\)[^{}]*\{[^}]*for\s*\([^)]*\)/;
		if (nestedLoopPattern.test(code)) {
			score -= 15;
		}

		// Check for using Map/Set (often more efficient)
		if (code.includes("new Map") || code.includes("new Set")) {
			score += 10;
		}

		// Check for sorting (O(n log n))
		if (code.includes(".sort(")) {
			score += 5;
		}

		// Check for early returns (good practice)
		if (code.includes("return") && code.split("return").length > 2) {
			score += 5;
		}

		return Math.min(100, Math.max(0, score));
	};

	// Estimate code quality (simplified heuristic)
	const estimateCodeQuality = (code: string): number => {
		if (!code) return 50;

		let score = 70;

		// Check for comments
		if (code.includes("//") || code.includes("/*")) {
			score += 10;
		}

		// Check for meaningful variable names (heuristic: longer names)
		const variablePattern = /(?:let|const|var)\s+(\w+)/g;
		const matches = code.match(variablePattern) || [];
		const avgNameLength =
			matches.reduce((sum, m) => sum + m.split(/\s+/)[1]?.length || 0, 0) /
			Math.max(matches.length, 1);
		if (avgNameLength > 5) {
			score += 10;
		}

		// Check for consistent formatting (rough check)
		if (code.includes("\n  ") || code.includes("\n\t")) {
			score += 5;
		}

		// Penalize very long functions
		if (code.length > 2000) {
			score -= 10;
		}

		return Math.min(100, Math.max(0, score));
	};

	// Generate feedback messages
	const generateFeedback = (
		correctness: number,
		efficiency: number,
		codeQuality: number,
		collaboration: number
	): string[] => {
		const feedback: string[] = [];

		if (correctness >= 90) {
			feedback.push(
				"Excellent work! Your team's solution passes all test cases."
			);
		} else if (correctness >= 70) {
			feedback.push("Good progress! Most test cases are passing.");
		} else {
			feedback.push(
				"Your solution needs some refinement to pass more test cases."
			);
		}

		if (collaboration >= 80) {
			feedback.push(
				"Great teamwork - all members contributed to the solution."
			);
		}

		return feedback;
	};

	// Generate strengths
	const generateStrengths = (
		correctness: number,
		efficiency: number,
		codeQuality: number,
		collaboration: number
	): string[] => {
		const strengths: string[] = [];

		if (correctness >= 80) strengths.push("High test pass rate");
		if (efficiency >= 80) strengths.push("Efficient algorithm approach");
		if (codeQuality >= 80) strengths.push("Clean, readable code");
		if (collaboration >= 80) strengths.push("Effective team collaboration");

		if (strengths.length === 0) {
			strengths.push("Completed the challenge together");
		}

		return strengths;
	};

	// Generate improvement suggestions
	const generateImprovements = (
		correctness: number,
		efficiency: number,
		codeQuality: number,
		collaboration: number
	): string[] => {
		const improvements: string[] = [];

		if (correctness < 80)
			improvements.push("Review edge cases in your solution");
		if (efficiency < 70)
			improvements.push("Consider optimizing time complexity");
		if (codeQuality < 70)
			improvements.push("Add comments to explain complex logic");
		if (collaboration < 80)
			improvements.push("Ensure all team members contribute");

		if (improvements.length === 0) {
			improvements.push("Keep practicing to tackle harder problems!");
		}

		return improvements;
	};

	// Score color helper
	const getScoreColor = (score: number): string => {
		if (score >= 80) return "text-green-400";
		if (score >= 60) return "text-yellow-400";
		return "text-red-400";
	};

	const getScoreBgColor = (score: number): string => {
		if (score >= 80) return "bg-green-500/20";
		if (score >= 60) return "bg-yellow-500/20";
		return "bg-red-500/20";
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-[#171717] flex items-center justify-center">
				<div className="text-center">
					<Loader2
						className="text-purple-500 mx-auto mb-4 animate-spin"
						size={48}
					/>
					<div className="text-white text-xl">
						Loading collaboration summary...
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-[#171717] flex items-center justify-center">
				<div className="max-w-md mx-auto text-center p-8">
					<AlertTriangle className="text-yellow-500 mx-auto mb-4" size={64} />
					<h1 className="text-2xl font-bold text-white mb-4">
						Summary Not Available
					</h1>
					<p className="text-gray-400 mb-6">{error}</p>
					<button
						onClick={() => navigate("/explore")}
						className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition"
					>
						Back to Explore
					</button>
				</div>
			</div>
		);
	}

	if (!session || !teamEvaluation) {
		return (
			<div className="min-h-screen bg-[#171717] flex items-center justify-center">
				<div className="text-center">
					<AlertTriangle className="text-red-500 mx-auto mb-4" size={64} />
					<div className="text-white text-xl mb-4">Summary not found</div>
					<button
						onClick={() => navigate("/explore")}
						className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition"
					>
						Back to Explore
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#171717] text-gray-200">
			{/* Header */}
			<header className="bg-[#2c2c2c] p-4 shadow-md">
				<div className="container mx-auto">
					<div className="flex items-center justify-between">
						<button
							onClick={() => navigate("/explore")}
							className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
						>
							<ArrowLeft size={18} className="mr-1" />
							Back to Explore
						</button>
						<h1 className="text-xl font-bold text-center flex-grow flex items-center justify-center">
							<Rocket className="mr-2 text-purple-500" size={24} />
							Team Collaboration Summary
						</h1>
						<div className="w-20"></div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="container mx-auto py-6 px-4 max-w-5xl">
				{/* Problem Info Banner */}
				<div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-6 mb-8 text-center">
					<div className="flex justify-center mb-4">
						<div
							className={`w-20 h-20 rounded-full flex items-center justify-center ${getScoreBgColor(
								teamEvaluation.overallScore
							)}`}
						>
							<span
								className={`text-3xl font-bold ${getScoreColor(
									teamEvaluation.overallScore
								)}`}
							>
								{teamEvaluation.overallScore}
							</span>
						</div>
					</div>
					<h2 className="text-2xl font-bold mb-2">
						{teamEvaluation.overallScore >= 80
							? "Excellent Teamwork! 🎉"
							: teamEvaluation.overallScore >= 60
							? "Good Effort! 👍"
							: "Keep Practicing! 💪"}
					</h2>
					<p className="text-lg text-gray-300">
						Problem:{" "}
						<span className="font-semibold text-purple-400">
							{session.problem?.title}
						</span>{" "}
						({session.problem?.difficulty})
					</p>
				</div>

				{/* Team Members */}
				<div className="bg-[#2c2c2c] rounded-lg p-6 mb-6 border border-gray-700">
					<h3 className="text-xl font-semibold mb-4 flex items-center">
						<Users className="mr-2 text-purple-500" size={20} />
						Team Members
					</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{teamMembers.map((member, index) => (
							<div
								key={index}
								className="flex items-center space-x-4 p-4 bg-[#1f1f1f] rounded-lg"
							>
								<div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg">
									{member.name.charAt(0).toUpperCase()}
								</div>
								<div className="flex-1">
									<p className="font-medium text-white">{member.name}</p>
									<div className="flex items-center space-x-3 text-sm text-gray-400">
										<span className="flex items-center">
											<CheckCircle size={14} className="mr-1 text-green-400" />
											{member.passedTests}/{member.totalTests} tests
										</span>
										<span className="flex items-center">
											<Clock size={14} className="mr-1" />
											{member.submissionTime}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Team Evaluation Scores */}
				<div className="bg-[#2c2c2c] rounded-lg p-6 mb-6 border border-gray-700">
					<h3 className="text-xl font-semibold mb-4 flex items-center">
						<Award className="mr-2 text-purple-500" size={20} />
						Team Evaluation
					</h3>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{/* Correctness */}
						<div className="text-center p-4 bg-[#1f1f1f] rounded-lg">
							<CheckCircle
								className={`mx-auto mb-2 ${getScoreColor(
									teamEvaluation.correctness
								)}`}
								size={24}
							/>
							<div
								className={`text-2xl font-bold ${getScoreColor(
									teamEvaluation.correctness
								)}`}
							>
								{teamEvaluation.correctness}%
							</div>
							<div className="text-sm text-gray-400">Correctness</div>
						</div>

						{/* Efficiency */}
						<div className="text-center p-4 bg-[#1f1f1f] rounded-lg">
							<Zap
								className={`mx-auto mb-2 ${getScoreColor(
									teamEvaluation.efficiency
								)}`}
								size={24}
							/>
							<div
								className={`text-2xl font-bold ${getScoreColor(
									teamEvaluation.efficiency
								)}`}
							>
								{teamEvaluation.efficiency}%
							</div>
							<div className="text-sm text-gray-400">Efficiency</div>
						</div>

						{/* Code Quality */}
						<div className="text-center p-4 bg-[#1f1f1f] rounded-lg">
							<Code
								className={`mx-auto mb-2 ${getScoreColor(
									teamEvaluation.codeQuality
								)}`}
								size={24}
							/>
							<div
								className={`text-2xl font-bold ${getScoreColor(
									teamEvaluation.codeQuality
								)}`}
							>
								{teamEvaluation.codeQuality}%
							</div>
							<div className="text-sm text-gray-400">Code Quality</div>
						</div>

						{/* Collaboration */}
						<div className="text-center p-4 bg-[#1f1f1f] rounded-lg">
							<Users
								className={`mx-auto mb-2 ${getScoreColor(
									teamEvaluation.collaboration
								)}`}
								size={24}
							/>
							<div
								className={`text-2xl font-bold ${getScoreColor(
									teamEvaluation.collaboration
								)}`}
							>
								{teamEvaluation.collaboration}%
							</div>
							<div className="text-sm text-gray-400">Collaboration</div>
						</div>
					</div>
				</div>

				{/* Feedback Section */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					{/* Strengths */}
					<div className="bg-[#2c2c2c] rounded-lg p-6 border border-gray-700">
						<h3 className="text-lg font-semibold mb-4 flex items-center text-green-400">
							<Star className="mr-2" size={20} />
							Team Strengths
						</h3>
						<ul className="space-y-2">
							{teamEvaluation.strengths.map((strength, index) => (
								<li key={index} className="flex items-start space-x-2">
									<CheckCircle
										size={16}
										className="text-green-400 mt-1 flex-shrink-0"
									/>
									<span className="text-gray-300">{strength}</span>
								</li>
							))}
						</ul>
					</div>

					{/* Areas for Improvement */}
					<div className="bg-[#2c2c2c] rounded-lg p-6 border border-gray-700">
						<h3 className="text-lg font-semibold mb-4 flex items-center text-yellow-400">
							<TrendingUp className="mr-2" size={20} />
							Areas to Improve
						</h3>
						<ul className="space-y-2">
							{teamEvaluation.improvements.map((improvement, index) => (
								<li key={index} className="flex items-start space-x-2">
									<Lightbulb
										size={16}
										className="text-yellow-400 mt-1 flex-shrink-0"
									/>
									<span className="text-gray-300">{improvement}</span>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Overall Feedback */}
				<div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6 mb-6">
					<h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center">
						<Lightbulb className="mr-2" size={20} />
						Team Feedback
					</h3>
					<div className="space-y-2">
						{teamEvaluation.feedback.map((fb, index) => (
							<p key={index} className="text-gray-300">
								{fb}
							</p>
						))}
					</div>
				</div>

				{/* Code Preview */}
				{sharedCode && (
					<div className="bg-[#2c2c2c] rounded-lg p-6 border border-gray-700">
						<h3 className="text-lg font-semibold mb-4 flex items-center">
							<Code className="mr-2 text-purple-500" size={20} />
							Your Team's Solution
						</h3>
						<div className="bg-[#1e1e1e] rounded-lg p-4 overflow-x-auto">
							<pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
								{sharedCode.slice(0, 1500)}
								{sharedCode.length > 1500 && (
									<span className="text-gray-500">... (truncated)</span>
								)}
							</pre>
						</div>
					</div>
				)}

				{/* Action Button */}
				<div className="text-center mt-8">
					<button
						onClick={() => navigate("/explore")}
						className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-medium transition inline-flex items-center"
					>
						<Rocket className="mr-2" size={20} />
						Start Another Collaboration
					</button>
				</div>
			</main>
		</div>
	);
}
