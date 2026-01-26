import { CheckCircle, X } from "lucide-react";

interface SubmissionModalProps {
	isOpen: boolean;
	onClose: () => void;
	allPassed: boolean;
	passedCount: number;
	totalCount: number;
}

export const SubmissionModal = ({
	isOpen,
	onClose,
	allPassed,
	passedCount,
	totalCount,
}: SubmissionModalProps) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
			<div className="relative bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-200">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<div className="flex items-center space-x-3">
						<div
							className={`w-12 h-12 rounded-full flex items-center justify-center ${
								allPassed ? "bg-green-100" : "bg-yellow-100"
							}`}
						>
							<CheckCircle
								size={24}
								className={allPassed ? "text-green-600" : "text-yellow-600"}
							/>
						</div>
						<h2 className="text-xl font-semibold text-gray-900">
							{allPassed ? "Solution Accepted!" : "Solution Submitted"}
						</h2>
					</div>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 transition"
					>
						<X size={20} />
					</button>
				</div>

				{/* Content */}
				<div className="p-6 space-y-4">
					<div className="text-gray-700">
						{allPassed ? (
							<>
								<p className="mb-2">
									🎉 Congratulations! Your solution passed all test cases.
								</p>
								<div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
									<p className="text-green-700 text-sm">
										✓ {passedCount}/{totalCount} test cases passed
									</p>
								</div>
							</>
						) : (
							<>
								<p className="mb-2">Your solution has been submitted.</p>
								<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
									<p className="text-yellow-700 text-sm">
										{passedCount}/{totalCount} test cases passed
									</p>
								</div>
							</>
						)}

						<div className="bg-sky-50 border border-sky-200 rounded-lg p-4 space-y-2">
							<p className="font-medium text-sky-700">What happens next?</p>
							<ul className="text-sm space-y-1 text-gray-600">
								<li>• You'll be redirected to the Explore page</li>
								<li>• Wait for other players to submit their solutions</li>
								<li>
									• You'll receive a notification when all players have
									submitted
								</li>
								<li>• Click the notification to view the match summary</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="p-6 border-t border-gray-200">
					<button
						onClick={onClose}
						className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 px-4 rounded-lg font-medium transition"
					>
						Continue to Explore
					</button>
				</div>
			</div>
		</div>
	);
};
