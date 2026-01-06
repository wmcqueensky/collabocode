import { ArrowLeft, ArrowRight, X } from "lucide-react";

type ModalFooterProps = {
	step: number;
	totalSteps?: number;
	setStep: (n: number) => void;
	onClose: () => void;
	startAction?: () => void;
	startActionText?: string;
	canContinue?: boolean;
	canStart?: boolean;
};

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
		if (step < totalSteps) setStep(step + 1);
	};

	const handleBack = () => {
		if (step > 1) setStep(step - 1);
	};

	return (
		<div className="p-3 sm:p-4 border-t border-[#3d3654] bg-[#252525] flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
			<div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
				{Array.from({ length: totalSteps }, (_, i) => (
					<div
						key={i}
						className={`h-2 w-6 sm:w-8 rounded-full transition-all duration-300 ${
							i + 1 <= step ? "bg-[#8b5cf6]" : "bg-gray-700"
						}`}
					/>
				))}
				<span className="text-gray-400 text-sm ml-2">
					Step {step} of {totalSteps}
				</span>
			</div>
			<div className="flex gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
				<button
					type="button"
					onClick={onClose}
					className="px-2 sm:px-4 py-2 rounded-md flex items-center justify-center text-gray-300 hover:text-white transition"
					aria-label="Cancel"
				>
					<X size={18} className="sm:mr-1" />
					<span className="hidden sm:inline">Cancel</span>
				</button>
				{step > 1 && (
					<button
						type="button"
						onClick={handleBack}
						className="px-2 sm:px-4 py-2 bg-[#3a3a3a] rounded-md flex items-center justify-center text-gray-300 hover:text-white transition"
						aria-label="Back"
					>
						<ArrowLeft size={18} className="sm:mr-1" />
						<span className="hidden sm:inline">Back</span>
					</button>
				)}
				{step < totalSteps && (
					<button
						type="button"
						onClick={handleNext}
						disabled={!canContinue}
						className={`px-2 sm:px-4 py-2 rounded-md flex items-center justify-center transition flex-grow sm:flex-grow-0 ${
							canContinue
								? "bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
								: "bg-gray-700 text-gray-400 cursor-not-allowed"
						}`}
						aria-label="Next"
					>
						<span className="hidden sm:inline">Next</span>
						<ArrowRight size={18} className="sm:ml-1" />
					</button>
				)}
				{step === totalSteps && (
					<button
						type="button"
						onClick={startAction}
						disabled={!canStart}
						className={`px-2 sm:px-4 py-2 rounded-md flex items-center justify-center transition flex-grow sm:flex-grow-0 ${
							canStart
								? "bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
								: "bg-gray-700 text-gray-400 cursor-not-allowed"
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
