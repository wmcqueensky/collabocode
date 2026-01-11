import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, Loader2, Home } from "lucide-react";
import type { SessionParticipant } from "../../../types/database";

interface WaitingForSubmissionModalProps {
	isOpen: boolean;
	participants: SessionParticipant[];
	currentUserId: string;
	onAllSubmitted?: () => void;
}

export const WaitingForSubmissionModal = ({
	isOpen,
	participants,
	currentUserId,
	onAllSubmitted,
}: WaitingForSubmissionModalProps) => {
	const navigate = useNavigate();
	const [elapsedTime, setElapsedTime] = useState(0);
	const [redirectCountdown, setRedirectCountdown] = useState<number | null>(
		null
	);

	// Timer for elapsed time
	useEffect(() => {
		if (!isOpen) {
			setElapsedTime(0);
			setRedirectCountdown(null);
			return;
		}

		const interval = setInterval(() => {
			setElapsedTime((prev) => prev + 1);
		}, 1000);

		return () => clearInterval(interval);
	}, [isOpen]);

	// Check if all participants are ready to submit
	const joinedParticipants = participants.filter((p) => p.status === "joined");

	// Check for ready_to_submit flag in test_results (new way)
	// or fall back to submission_time (old way for backward compatibility)
	const readyCount = joinedParticipants.filter((p) => {
		const testResults = p.test_results as any;
		return testResults?.ready_to_submit || p.submission_time;
	}).length;

	// Check if all have final_submission (actual code submitted)
	const submittedCount = joinedParticipants.filter((p) => {
		const testResults = p.test_results as any;
		return testResults?.final_submission;
	}).length;

	const allReady =
		readyCount === joinedParticipants.length && joinedParticipants.length > 0;
	const allSubmitted =
		submittedCount === joinedParticipants.length &&
		joinedParticipants.length > 0;

	// Handle redirect countdown when all submitted
	useEffect(() => {
		if (allSubmitted && redirectCountdown === null) {
			setRedirectCountdown(3);
		}
	}, [allSubmitted, redirectCountdown]);

	// Countdown effect
	useEffect(() => {
		if (redirectCountdown === null) return;

		if (redirectCountdown === 0) {
			if (onAllSubmitted) {
				onAllSubmitted();
			} else {
				navigate("/explore");
			}
			return;
		}

		const timer = setTimeout(() => {
			setRedirectCountdown((prev) => (prev !== null ? prev - 1 : null));
		}, 1000);

		return () => clearTimeout(timer);
	}, [redirectCountdown, onAllSubmitted, navigate]);

	if (!isOpen) return null;

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	// Helper to get participant status
	const getParticipantStatus = (participant: SessionParticipant) => {
		const testResults = participant.test_results as any;
		if (testResults?.final_submission) {
			return "submitted";
		} else if (testResults?.ready_to_submit || participant.submission_time) {
			return "ready";
		}
		return "working";
	};

	return (
		<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
			<div className="bg-[#1f1f1f] rounded-xl border border-gray-700 p-6 max-w-md w-full mx-4">
				{/* Header */}
				<div className="text-center mb-6">
					{allSubmitted ? (
						<>
							<div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
								<CheckCircle size={32} className="text-green-500" />
							</div>
							<h2 className="text-xl font-bold text-white mb-2">
								All Team Members Submitted!
							</h2>
							<p className="text-gray-400 text-sm">
								Redirecting to explore in {redirectCountdown}...
							</p>
							<p className="text-gray-500 text-xs mt-2">
								You'll receive a notification when team results are ready
							</p>
						</>
					) : allReady ? (
						<>
							<div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
								<Loader2 size={32} className="text-blue-500 animate-spin" />
							</div>
							<h2 className="text-xl font-bold text-white mb-2">
								All Ready - Evaluating Code...
							</h2>
							<p className="text-gray-400 text-sm">
								Running final tests on your team's solution
							</p>
						</>
					) : (
						<>
							<div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
								<Loader2 size={32} className="text-purple-500 animate-spin" />
							</div>
							<h2 className="text-xl font-bold text-white mb-2">
								Waiting for Team Members
							</h2>
							<p className="text-gray-400 text-sm">
								Your teammates can still edit the code until they click Submit
							</p>
						</>
					)}
				</div>

				{/* Progress */}
				<div className="mb-6">
					<div className="flex justify-between items-center mb-2 text-sm">
						<span className="text-gray-400">Team Ready</span>
						<span className="text-white font-medium">
							{readyCount} / {joinedParticipants.length}
						</span>
					</div>
					<div className="h-2 bg-gray-700 rounded-full overflow-hidden">
						<div
							className={`h-full transition-all duration-500 ${
								allSubmitted
									? "bg-green-500"
									: allReady
									? "bg-blue-500"
									: "bg-gradient-to-r from-purple-500 to-purple-600"
							}`}
							style={{
								width: `${
									(readyCount / Math.max(joinedParticipants.length, 1)) * 100
								}%`,
							}}
						/>
					</div>
				</div>

				{/* Participants Status */}
				<div className="space-y-2 mb-6">
					{joinedParticipants.map((participant) => {
						const isCurrentUser = participant.user_id === currentUserId;
						const status = getParticipantStatus(participant);

						return (
							<div
								key={participant.id}
								className={`flex items-center justify-between p-3 rounded-lg ${
									isCurrentUser
										? "bg-purple-500/10 border border-purple-500/30"
										: "bg-[#2a2a2a]"
								}`}
							>
								<div className="flex items-center space-x-3">
									<div
										className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
											status === "submitted"
												? "bg-green-500 text-white"
												: status === "ready"
												? "bg-blue-500 text-white"
												: "bg-gray-600 text-gray-300"
										}`}
									>
										{participant.user?.username?.charAt(0).toUpperCase() || "?"}
									</div>
									<div>
										<p className="text-white text-sm font-medium">
											{participant.user?.username || "Unknown"}
											{isCurrentUser && (
												<span className="text-purple-400 ml-1">(You)</span>
											)}
										</p>
									</div>
								</div>

								<div className="flex items-center">
									{status === "submitted" ? (
										<div className="flex items-center text-green-500">
											<CheckCircle size={16} className="mr-1" />
											<span className="text-xs">Submitted</span>
										</div>
									) : status === "ready" ? (
										<div className="flex items-center text-blue-500">
											<CheckCircle size={16} className="mr-1" />
											<span className="text-xs">Ready</span>
										</div>
									) : (
										<div className="flex items-center text-yellow-500">
											<Loader2 size={16} className="mr-1 animate-spin" />
											<span className="text-xs">Working...</span>
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>

				{/* Timer / Action */}
				<div className="flex items-center justify-between">
					<div className="flex items-center text-gray-400 text-sm">
						<Clock size={14} className="mr-2" />
						<span>Waiting for {formatTime(elapsedTime)}</span>
					</div>

					{!allSubmitted && (
						<button
							onClick={() => navigate("/explore")}
							className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded transition"
						>
							<Home size={14} />
							<span>Leave & Wait</span>
						</button>
					)}
				</div>

				{/* Info message */}
				{!allReady && (
					<p className="text-center text-gray-500 text-xs mt-4">
						💡 The final code will be captured when all teammates click Submit
					</p>
				)}
			</div>
		</div>
	);
};

export default WaitingForSubmissionModal;
