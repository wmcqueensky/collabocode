import { ProblemDescription } from "./ProblemDescription";
import { TestCases } from "./TestCases";
import type { Problem } from "../../../types/database";

type ProblemPanelProps = {
	activeTab: string;
	setActiveTab: (tab: string) => void;
	testCases: any[];
	runTest: (index: any) => void;
	isMobile?: boolean;
	problem?: Problem;
};

export const ProblemPanel = ({
	activeTab,
	setActiveTab,
	testCases,
	runTest,
	isMobile = false,
	problem,
}: ProblemPanelProps) => {
	return (
		<div
			className={`${
				isMobile ? "w-full h-full" : "w-96 lg:w-80 xl:w-96"
			} flex flex-col bg-[#2c2c2c] border-r border-gray-700`}
		>
			{/* Tabs */}
			<div className="flex border-b border-gray-700">
				<button
					className={`flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm ${
						activeTab === "description"
							? "border-b-2 border-[#5bc6ca] text-[#5bc6ca]"
							: "text-gray-400"
					}`}
					onClick={() => setActiveTab("description")}
				>
					Description
				</button>
				<button
					className={`flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm ${
						activeTab === "tests"
							? "border-b-2 border-[#5bc6ca] text-[#5bc6ca]"
							: "text-gray-400"
					}`}
					onClick={() => setActiveTab("tests")}
				>
					Test Cases
				</button>
			</div>

			{/* Content */}
			<div
				className={`flex-1 overflow-auto p-3 sm:p-4 ${
					isMobile ? "pb-safe" : ""
				}`}
			>
				{activeTab === "description" ? (
					<ProblemDescription isMobile={isMobile} problem={problem} />
				) : (
					<TestCases
						testCases={testCases}
						runTest={runTest}
						isMobile={isMobile}
					/>
				)}
			</div>
		</div>
	);
};
