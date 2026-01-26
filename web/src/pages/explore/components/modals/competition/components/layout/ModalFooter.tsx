import { ArrowLeft, ArrowRight, X } from "lucide-react";
import type { ModalFooterProps } from "../../types";

const ModalFooter = ({
	step,
	totalSteps = 3,
	setStep,
	onClose,
	startAction,
	startActionText = "Start Session",
	canContinue = true,
	canStart = true,
}: ModalFooterProps) => {
	const handleNext = () => {
		if (step < totalSteps) {
			setStep(step + 1);
		}
	};

	const handleBack = () => {
		if (step > 1) {
			setStep(step - 1);
		}
	};

	return (
		<div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
			{/* Progress Indicators */}
			<div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
				{Array.from({ length: totalSteps }, (_, i) => (
					<div
						key={i}
						className={`h-2 w-6 sm:w-8 rounded-full ${
							i + 1 <= step ? "bg-sky-600" : "bg-gray-300"
						}`}
					/>
				))}
				<span className="text-gray-600 text-sm ml-2">
					Step {step} of {totalSteps}
				</span>
			</div>

			{/* Action Buttons */}
			<div className="flex gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
				{/* Cancel Button */}
				<button
					type="button"
					onClick={onClose}
					className="px-2 sm:px-4 py-2 rounded-md flex items-center justify-center text-gray-600 hover:text-gray-900 transition"
					aria-label="Cancel"
				>
					<X size={18} className="sm:mr-1" />
					<span className="hidden sm:inline">Cancel</span>
				</button>

				{/* Back Button (hide on first step) */}
				{step > 1 && (
					<button
						type="button"
						onClick={handleBack}
						className="px-2 sm:px-4 py-2 bg-gray-200 rounded-md flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-300 transition"
						aria-label="Back"
					>
						<ArrowLeft size={18} className="sm:mr-1" />
						<span className="hidden sm:inline">Back</span>
					</button>
				)}

				{/* Next Button (on steps 1 and 2) */}
				{step < totalSteps && (
					<button
						type="button"
						onClick={handleNext}
						disabled={!canContinue}
						className={`px-2 sm:px-4 py-2 rounded-md flex items-center justify-center transition flex-grow sm:flex-grow-0 ${
							canContinue
								? "bg-sky-600 text-white hover:bg-sky-700"
								: "bg-gray-200 text-gray-400 cursor-not-allowed"
						}`}
						aria-label="Next"
					>
						<span className="hidden sm:inline">Next</span>
						<ArrowRight size={18} className="sm:ml-1" />
					</button>
				)}

				{/* Start Button (on final step) */}
				{step === totalSteps && (
					<button
						type="button"
						onClick={startAction}
						disabled={!canStart}
						className={`px-2 sm:px-4 py-2 rounded-md flex items-center justify-center transition flex-grow sm:flex-grow-0 ${
							canStart
								? "bg-sky-600 text-white hover:bg-sky-700"
								: "bg-gray-200 text-gray-400 cursor-not-allowed"
						}`}
					>
						{startActionText}
					</button>
				)}
			</div>
		</div>
	);
};

export default ModalFooter;
