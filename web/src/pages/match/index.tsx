import { useParams } from "react-router-dom";

// Components
import { OutputPanel } from "./editor/OutputPanel";
import { ProblemPanel } from "./problem-panel/ProblemPanel";
import { Navbar } from "./layout/Navbar";
import { ChatPanel } from "./chat/ChatPanel";
import { MonacoEditor } from "./editor/MonacoEditor";
import Footer from "./layout/Footer";
import { RaceTrack } from "./chat/RaceTrack";
import { RecentActivities } from "./chat/RecentActivities";
import { WaitingLobby } from "./lobby/WaitingLobby";
import { SubmissionModal } from "./modals/SubmissionModal";

// Hooks
import { useMatchPage } from "./hooks/useMatchPage";

// Constants
import { getFileExtension } from "./constants";

export default function MatchPage() {
	const { sessionId } = useParams<{ sessionId: string }>();

	const {
		// Session data
		session,
		dbParticipants,
		loading,
		error,

		// Timer
		timeStr,

		// UI state
		activeProblemTab,
		setActiveProblemTab,
		isChatOpen,
		setIsChatOpen,
		isMobileMenuOpen,
		setIsMobileMenuOpen,
		activePanel,
		setActivePanel,
		isMicOn,
		setIsMicOn,

		// Code editor
		code,
		language,
		updateCode,

		// Test cases
		testCases,
		output,
		runTest,

		// Participants
		participants,

		// Activities
		activities,

		// User
		currentUserId,

		// Session state
		showWaitingLobby,
		showSubmissionModal,
		submissionResult,

		// Actions
		handleStartSession,
		handleRun,
		handleSubmit,
		handleModalClose,
	} = useMatchPage({ sessionId });

	// Loading state
	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen bg-[#171717]">
				<div className="text-white text-xl">Loading session...</div>
			</div>
		);
	}

	// Error state
	if (error || !session) {
		return (
			<div className="flex flex-col items-center justify-center h-screen bg-[#171717]">
				<div className="text-red-400 text-xl mb-4">
					{error || "Session not found"}
				</div>
				<a
					href="/explore"
					className="bg-[#5bc6ca] hover:bg-[#48aeb3] text-white px-6 py-2 rounded"
				>
					Back to Explore
				</a>
			</div>
		);
	}

	// Show waiting lobby if session hasn't started
	if (showWaitingLobby && dbParticipants) {
		return (
			<WaitingLobby
				session={session}
				participants={dbParticipants}
				currentUserId={currentUserId}
				onStartSession={handleStartSession}
			/>
		);
	}

	// File structure for Monaco Editor
	const file = {
		name: `solution.${getFileExtension(language)}`,
		language: language,
		content: code,
	};

	return (
		<div className="flex flex-col h-screen bg-[#171717] text-gray-200">
			{/* Submission Modal */}
			{submissionResult && (
				<SubmissionModal
					isOpen={showSubmissionModal}
					onClose={handleModalClose}
					allPassed={submissionResult.allPassed}
					passedCount={submissionResult.passedCount}
					totalCount={submissionResult.totalCount}
				/>
			)}

			{/* Navbar */}
			<Navbar
				time={timeStr}
				handleRun={handleRun}
				handleSubmit={handleSubmit}
				activePanel={activePanel}
				setActivePanel={setActivePanel}
				isMobileMenuOpen={isMobileMenuOpen}
				setIsMobileMenuOpen={setIsMobileMenuOpen}
				problemTitle={session.problem?.title || "Problem"}
				participantCount={participants.length}
				maxParticipants={session.max_players}
			/>

			{/* Mobile Panel Navigation */}
			<div className="md:hidden flex bg-[#2c2c2c] border-b border-gray-700">
				<button
					className={`flex-1 py-2 px-4 text-sm ${
						activePanel === "problem"
							? "border-b-2 border-[#5bc6ca] text-[#5bc6ca]"
							: "text-gray-400"
					}`}
					onClick={() => setActivePanel("problem")}
				>
					Problem
				</button>
				<button
					className={`flex-1 py-2 px-4 text-sm ${
						activePanel === "editor"
							? "border-b-2 border-[#5bc6ca] text-[#5bc6ca]"
							: "text-gray-400"
					}`}
					onClick={() => setActivePanel("editor")}
				>
					Code
				</button>
				<button
					className={`flex-1 py-2 px-4 text-sm ${
						activePanel === "chat"
							? "border-b-2 border-[#5bc6ca] text-[#5bc6ca]"
							: "text-gray-400"
					}`}
					onClick={() => setActivePanel("chat")}
				>
					Chat
				</button>
			</div>

			{/* Main Content */}
			<div className="flex flex-1 overflow-hidden">
				{/* Desktop Layout */}
				<div className="hidden md:flex flex-1 overflow-hidden">
					{/* Left Panel - Problem Description */}
					<ProblemPanel
						activeTab={activeProblemTab}
						setActiveTab={setActiveProblemTab}
						testCases={testCases}
						runTest={runTest}
						problem={session.problem}
					/>

					{/* Middle Section - Code Editor */}
					<div className="flex flex-1 overflow-hidden border-l border-r border-gray-700">
						<div className="flex flex-col flex-1">
							<MonacoEditor
								file={file}
								updateFileContent={(_: any, content: any) =>
									updateCode(content)
								}
							/>
							<OutputPanel output={output} />
						</div>
					</div>

					{/* Right Panel - Chat */}
					{isChatOpen && (
						<div className="w-80 bg-[#1a1a1a] border-l border-gray-700 flex flex-col">
							<div className="flex-1 min-h-0 max-h-[60%]">
								<ChatPanel
									isMicOn={isMicOn}
									setIsMicOn={setIsMicOn}
									sessionId={sessionId}
								/>
							</div>
							<div className="flex-shrink-0 p-4 space-y-4 bg-[#171717] border-t border-gray-700 overflow-y-auto max-h-[40%]">
								<RaceTrack participants={participants} />
								<RecentActivities activities={activities} />
							</div>
						</div>
					)}
				</div>

				{/* Mobile Layout */}
				<div className="md:hidden flex-1 overflow-hidden">
					{activePanel === "problem" && (
						<ProblemPanel
							activeTab={activeProblemTab}
							setActiveTab={setActiveProblemTab}
							testCases={testCases}
							runTest={runTest}
							isMobile={true}
							problem={session.problem}
						/>
					)}

					{activePanel === "editor" && (
						<div className="flex flex-col h-full">
							<div className="flex-1 min-h-0">
								<MonacoEditor
									file={file}
									updateFileContent={(_: any, content: any) =>
										updateCode(content)
									}
									isMobile={true}
								/>
							</div>
							<div className="h-32 flex-shrink-0">
								<OutputPanel output={output} />
							</div>
						</div>
					)}

					{activePanel === "chat" && (
						<div className="h-full bg-[#1a1a1a] flex flex-col">
							<div className="flex-1 min-h-0">
								<ChatPanel
									isMicOn={isMicOn}
									setIsMicOn={setIsMicOn}
									isMobile={true}
									sessionId={sessionId}
								/>
							</div>
							<div className="flex-shrink-0 max-h-[40%] overflow-y-auto">
								<div className="p-2 space-y-2 bg-[#171717] border-t border-gray-700">
									<RaceTrack participants={participants} isMobile={true} />
									<RecentActivities activities={activities} isMobile={true} />
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			<Footer
				isChatOpen={isChatOpen}
				setIsChatOpen={setIsChatOpen}
				activePanel={activePanel}
				setActivePanel={setActivePanel}
			/>
		</div>
	);
}
