import React from "react";
import { Clock, CheckCircle, Loader2, Home } from "lucide-react";
import type { SessionParticipant } from "../../../types/database";

interface WaitingForSubmissionModalProps {
	isOpen: boolean;
	participants: SessionParticipant[];
	currentUserId: string;
	elapsedTime: number;
	redirectCountdown: number | null;
	readyCount: number;
	submittedCount: number;
	allReady: boolean;
	allSubmitted: boolean;
	onLeave: () => void;
}

// Helper function to format time
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

export const WaitingForSubmissionModal: React.FC<
	WaitingForSubmissionModalProps
> = ({
	isOpen,
	participants,
	currentUserId,
	elapsedTime,
	redirectCountdown,
	readyCount,
	submittedCount: _submittedCount,
	allReady,
	allSubmitted,
	onLeave,
}) => {
	if (!isOpen) return null;

	const joinedParticipants = participants.filter((p) => p.status === "joined");

	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
			<div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 max-w-md w-full mx-4">
				{/* Header */}
				<div className="text-center mb-6">
					{allSubmitted ? (
						<>
							<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<CheckCircle size={32} className="text-green-600" />
							</div>
							<h2 className="text-xl font-bold text-gray-900 mb-2">
								All Team Members Submitted!
							</h2>
							<p className="text-gray-600 text-sm">
								Redirecting to explore in {redirectCountdown}...
							</p>
							<p className="text-gray-500 text-xs mt-2">
								You'll receive a notification when team results are ready
							</p>
						</>
					) : allReady ? (
						<>
							<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<Loader2 size={32} className="text-blue-600 animate-spin" />
							</div>
							<h2 className="text-xl font-bold text-gray-900 mb-2">
								All Ready - Evaluating Code...
							</h2>
							<p className="text-gray-600 text-sm">
								Running final tests on your team's solution
							</p>
						</>
					) : (
						<>
							<div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<Loader2 size={32} className="text-purple-600 animate-spin" />
							</div>
							<h2 className="text-xl font-bold text-gray-900 mb-2">
								Waiting for Team Members
							</h2>
							<p className="text-gray-600 text-sm">
								Your teammates can still edit the code until they click Submit
							</p>
						</>
					)}
				</div>

				{/* Progress */}
				<div className="mb-6">
					<div className="flex justify-between items-center mb-2 text-sm">
						<span className="text-gray-500">Team Ready</span>
						<span className="text-gray-900 font-medium">
							{readyCount} / {joinedParticipants.length}
						</span>
					</div>
					<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
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
								className={`flex items-center justify-between p-3 rounded-lg border ${
									isCurrentUser
										? "bg-purple-50 border-purple-300"
										: "bg-gray-50 border-gray-200"
								}`}
							>
								<div className="flex items-center space-x-3">
									<div
										className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
											status === "submitted"
												? "bg-green-500 text-white"
												: status === "ready"
													? "bg-blue-500 text-white"
													: "bg-gray-400 text-white"
										}`}
									>
										{participant.user?.username?.charAt(0).toUpperCase() || "?"}
									</div>
									<div>
										<p className="text-gray-900 text-sm font-medium">
											{participant.user?.username || "Unknown"}
											{isCurrentUser && (
												<span className="text-purple-600 ml-1">(You)</span>
											)}
										</p>
									</div>
								</div>

								<div className="flex items-center">
									{status === "submitted" ? (
										<div className="flex items-center text-green-600">
											<CheckCircle size={16} className="mr-1" />
											<span className="text-xs">Submitted</span>
										</div>
									) : status === "ready" ? (
										<div className="flex items-center text-blue-600">
											<CheckCircle size={16} className="mr-1" />
											<span className="text-xs">Ready</span>
										</div>
									) : (
										<div className="flex items-center text-yellow-600">
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
					<div className="flex items-center text-gray-500 text-sm">
						<Clock size={14} className="mr-2" />
						<span>Waiting for {formatTime(elapsedTime)}</span>
					</div>

					{!allSubmitted && (
						<button
							onClick={onLeave}
							className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition"
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
