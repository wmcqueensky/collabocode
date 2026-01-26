import {
	Clock,
	Code,
	Play,
	Send,
	ChevronLeft,
	Menu,
	MessageSquare,
	CheckCircle,
	Rocket,
	Wifi,
	WifiOff,
} from "lucide-react";

// Components
import { OutputPanel } from "./components/OutputPanel";
import { ChatPanel } from "./components/ChatPanel";
import { WaitingLobby } from "./components/WaitingLobby";
import { ProblemPanel } from "./components/ProblemPanel";
import CollaborativeMonacoEditor from "./components/CollaborativeMonacoEditor";
import WaitingForSubmissionModal from "./components/WaitingForSubmissionModal";

// Hooks
import { useCollaborationPage } from "./hooks/useCollaborationPage";
import { useChatPanel } from "./hooks/useChatPanel";
import { useWaitingLobby } from "./hooks/useWaitingLobby";
import { useWaitingForSubmissionModal } from "./hooks/useWaitingForSubmissionModal";

// Constants
import { LOW_TIME_THRESHOLD } from "./constants";

export default function CollaborationPage() {
	// Main page hook
	const {
		sessionId,
		session,
		participants,
		loading,
		error,
		currentUserId,
		showWaitingLobby,
		seconds,
		timeStr,
		collaborationDoc,
		isYjsConnected,
		remoteCursors,
		output,
		testCases,
		isChatOpen,
		activeProblemTab,
		mobileView,
		isMobile,
		hasClickedSubmit,
		hasSubmitted,
		showWaitingModal,
		handleStartSession,
		handleRun,
		handleRunTest,
		handleSubmit,
		handleAllSubmitted,
		toggleChat,
		setActiveProblemTab,
		setMobileView,
		getFileInfo,
		navigate,
	} = useCollaborationPage();

	// Chat panel hook
	const chatPanel = useChatPanel({ sessionId });

	// Waiting lobby hook (only used when showWaitingLobby is true)
	const waitingLobby = useWaitingLobby({
		session,
		initialParticipants: participants,
		currentUserId,
	});

	// Waiting for submission modal hook
	const submissionModal = useWaitingForSubmissionModal({
		isOpen: showWaitingModal,
		participants,
		onAllSubmitted: handleAllSubmitted,
	});

	// Loading state
	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-50">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
					<p className="text-gray-500">Loading collaboration session...</p>
				</div>
			</div>
		);
	}

	// Error state
	if (error || !session) {
		return (
			<div className="flex flex-col items-center justify-center h-screen bg-gray-50">
				<div className="text-red-600 text-xl mb-4">
					{error || "Session not found"}
				</div>
				<button
					onClick={() => navigate("/explore")}
					className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg"
				>
					Back to Explore
				</button>
			</div>
		);
	}

	// Waiting lobby
	if (showWaitingLobby) {
		return (
			<WaitingLobby
				session={session}
				participants={waitingLobby.participants}
				currentUserId={currentUserId}
				timeElapsed={waitingLobby.timeElapsed}
				isHost={waitingLobby.isHost}
				canStart={waitingLobby.canStart}
				joinedCount={waitingLobby.joinedCount}
				invitedCount={waitingLobby.invitedCount}
				declinedCount={waitingLobby.declinedCount}
				allPlayersJoined={waitingLobby.allPlayersJoined}
				onStartSession={handleStartSession}
			/>
		);
	}

	// File info for the editor
	const file = getFileInfo();
	if (!file) return null;

	return (
		<div className="flex flex-col h-screen bg-gray-50 text-gray-700">
			{/* Waiting for Submission Modal */}
			<WaitingForSubmissionModal
				isOpen={showWaitingModal}
				participants={participants}
				currentUserId={currentUserId}
				elapsedTime={submissionModal.elapsedTime}
				redirectCountdown={submissionModal.redirectCountdown}
				readyCount={submissionModal.readyCount}
				submittedCount={submissionModal.submittedCount}
				allReady={submissionModal.allReady}
				allSubmitted={submissionModal.allSubmitted}
				onLeave={submissionModal.handleLeave}
			/>

			{/* Navbar */}
			<nav className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200 shadow-sm">
				<div className="flex items-center space-x-3">
					<button
						onClick={() => navigate("/explore")}
						className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
					>
						<ChevronLeft size={18} />
					</button>
					<div className="flex items-center space-x-2">
						<Rocket size={18} className="text-purple-500" />
						<span className="font-medium text-gray-900 truncate max-w-[200px]">
							{session.problem?.title || "Collaboration"}
						</span>
					</div>

					{/* Connection Status */}
					<div className="flex items-center space-x-1 text-xs">
						{isYjsConnected ? (
							<div className="flex items-center text-green-600">
								<Wifi size={12} className="mr-1" />
								<span className="hidden sm:inline">Live</span>
							</div>
						) : (
							<div className="flex items-center text-yellow-600">
								<WifiOff size={12} className="mr-1 animate-pulse" />
								<span className="hidden sm:inline">Connecting...</span>
							</div>
						)}
					</div>
				</div>

				<div className="flex items-center space-x-3">
					{/* Active Collaborators */}
					<div className="hidden sm:flex items-center space-x-1">
						<div className="flex -space-x-2">
							{Array.from(remoteCursors.values())
								.filter((state: any) => state.user?.id !== currentUserId)
								.slice(0, 3)
								.map((state: any, i) => (
									<div
										key={state.user?.id || i}
										className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white"
										style={{ backgroundColor: state.user?.color }}
										title={state.user?.name}
									>
										{state.user?.name?.charAt(0).toUpperCase()}
									</div>
								))}
						</div>
						{remoteCursors.size > 0 && (
							<span className="text-xs text-gray-500 ml-1">
								{remoteCursors.size} online
							</span>
						)}
					</div>

					{/* Timer */}
					<div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-sm">
						<Clock
							size={14}
							className={
								seconds < LOW_TIME_THRESHOLD ? "text-red-500" : "text-gray-500"
							}
						/>
						<span
							className={
								seconds < LOW_TIME_THRESHOLD ? "text-red-500" : "text-gray-900"
							}
						>
							{timeStr}
						</span>
					</div>

					{/* Run & Submit */}
					<button
						onClick={handleRun}
						disabled={hasClickedSubmit}
						className={`flex items-center space-x-1 px-3 py-1.5 rounded text-sm ${
							hasClickedSubmit
								? "bg-gray-200 text-gray-400 cursor-not-allowed"
								: "bg-gray-100 hover:bg-gray-200 text-gray-700"
						}`}
					>
						<Play size={14} />
						<span className="hidden sm:inline">Run</span>
					</button>
					<button
						onClick={handleSubmit}
						disabled={hasClickedSubmit}
						className={`flex items-center space-x-1 px-3 py-1.5 rounded text-sm ${
							hasClickedSubmit
								? "bg-green-500 text-white cursor-not-allowed"
								: "bg-purple-500 hover:bg-purple-600 text-white"
						}`}
					>
						{hasClickedSubmit ? <CheckCircle size={14} /> : <Send size={14} />}
						<span className="hidden sm:inline">
							{hasClickedSubmit
								? hasSubmitted
									? "Submitted"
									: "Ready"
								: "Submit"}
						</span>
					</button>
				</div>
			</nav>

			{/* Mobile Navigation */}
			{isMobile && (
				<div className="flex bg-white border-b border-gray-200">
					<button
						className={`flex-1 py-2 text-xs flex items-center justify-center space-x-1 ${
							mobileView === "problem"
								? "bg-purple-500 text-white"
								: "text-gray-500"
						}`}
						onClick={() => setMobileView("problem")}
					>
						<Menu size={14} />
						<span>Problem</span>
					</button>
					<button
						className={`flex-1 py-2 text-xs flex items-center justify-center space-x-1 ${
							mobileView === "code"
								? "bg-purple-500 text-white"
								: "text-gray-500"
						}`}
						onClick={() => setMobileView("code")}
					>
						<Code size={14} />
						<span>Code</span>
					</button>
					<button
						className={`flex-1 py-2 text-xs flex items-center justify-center space-x-1 ${
							mobileView === "chat"
								? "bg-purple-500 text-white"
								: "text-gray-500"
						}`}
						onClick={() => setMobileView("chat")}
					>
						<MessageSquare size={14} />
						<span>Chat</span>
					</button>
				</div>
			)}

			{/* Main Content */}
			<div className="flex flex-1 overflow-hidden">
				{/* Desktop Layout */}
				{!isMobile && (
					<>
						{/* Problem Panel */}
						<ProblemPanel
							activeTab={activeProblemTab}
							setActiveTab={setActiveProblemTab}
							testCases={testCases}
							runTest={handleRunTest}
							problem={session.problem}
						/>

						{/* Code Editor Section */}
						<div className="flex flex-col flex-1 border-l border-r border-gray-200">
							{/* File Tab */}
							<div className="flex items-center px-3 py-2 bg-white border-b border-gray-200">
								<div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded text-sm text-gray-900">
									<Code size={14} className="text-purple-500" />
									<span>{file.filename}</span>
									{isYjsConnected && (
										<span className="text-green-600 text-xs">● Live</span>
									)}
								</div>
								{hasClickedSubmit && !hasSubmitted && (
									<span className="ml-2 text-xs text-yellow-600">
										⏳ Waiting for teammates...
									</span>
								)}
							</div>

							{/* Collaborative Monaco Editor */}
							<CollaborativeMonacoEditor
								file={file}
								collaborationDoc={collaborationDoc}
								userId={currentUserId}
							/>

							{/* Output Panel */}
							<OutputPanel output={output} />
						</div>

						{/* Right Panel - Chat */}
						{isChatOpen && (
							<div className="w-80 flex flex-col bg-gray-50 border-l border-gray-200">
								<ChatPanel
									messages={chatPanel.messages}
									inputMessage={chatPanel.inputMessage}
									currentUserId={chatPanel.currentUserId}
									messagesEndRef={chatPanel.messagesEndRef}
									onSendMessage={chatPanel.handleSendMessage}
									onInputChange={chatPanel.updateInputMessage}
								/>
							</div>
						)}
					</>
				)}

				{/* Mobile Layout */}
				{isMobile && (
					<div className="flex flex-col flex-1 overflow-hidden">
						{mobileView === "problem" && (
							<div className="flex-1 overflow-hidden">
								<ProblemPanel
									activeTab={activeProblemTab}
									setActiveTab={setActiveProblemTab}
									testCases={testCases}
									runTest={handleRunTest}
									problem={session.problem}
									isMobile={true}
								/>
							</div>
						)}

						{mobileView === "code" && (
							<div className="flex flex-col flex-1 overflow-hidden">
								<CollaborativeMonacoEditor
									file={file}
									collaborationDoc={collaborationDoc}
									userId={currentUserId}
									isMobile={true}
								/>
								<OutputPanel output={output} isMobile={true} />
							</div>
						)}

						{mobileView === "chat" && (
							<div className="flex-1 overflow-hidden">
								<ChatPanel
									messages={chatPanel.messages}
									inputMessage={chatPanel.inputMessage}
									currentUserId={chatPanel.currentUserId}
									messagesEndRef={chatPanel.messagesEndRef}
									onSendMessage={chatPanel.handleSendMessage}
									onInputChange={chatPanel.updateInputMessage}
									isMobile={true}
								/>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Footer - Desktop */}
			{!isMobile && (
				<div className="flex items-center justify-between px-4 py-2 bg-white border-t border-gray-200 text-xs text-gray-500">
					<div className="flex items-center space-x-4">
						<span className="text-purple-600 font-medium">
							Collaboration Mode
						</span>
						<span>{session.language}</span>
						{isYjsConnected && (
							<span className="text-green-600">● Real-time sync active</span>
						)}
					</div>
					<div className="flex items-center space-x-4">
						<button
							onClick={toggleChat}
							className={`px-2 py-1 rounded ${
								isChatOpen
									? "bg-purple-100 text-purple-600"
									: "hover:bg-gray-100"
							}`}
						>
							{isChatOpen ? "Hide Chat" : "Show Chat"}
						</button>
					</div>
				</div>
			)}

			{/* Footer - Mobile */}
			{isMobile && (
				<div className="flex items-center justify-between px-3 py-2 bg-white border-t border-gray-200 text-xs">
					<div className="flex items-center space-x-2 text-gray-500">
						<Clock size={12} />
						<span>{timeStr}</span>
						{isYjsConnected && <span className="text-green-600">●</span>}
					</div>
					<div className="flex items-center space-x-2">
						<button
							onClick={handleRun}
							disabled={hasClickedSubmit}
							className={`px-3 py-1.5 rounded text-xs ${
								hasClickedSubmit
									? "bg-gray-200 text-gray-400"
									: "bg-gray-100 text-gray-700"
							}`}
						>
							Run
						</button>
						<button
							onClick={handleSubmit}
							disabled={hasClickedSubmit}
							className={`px-3 py-1.5 rounded text-xs ${
								hasClickedSubmit
									? "bg-green-500 text-white"
									: "bg-purple-500 text-white"
							}`}
						>
							{hasClickedSubmit
								? hasSubmitted
									? "Done ✓"
									: "Ready ✓"
								: "Submit"}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
