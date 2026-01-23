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
		isMicOn,
		activeProblemTab,
		mobileView,
		isMobile,
		hasClickedSubmit,
		hasSubmitted,
		showWaitingModal,
		handleStartSession,
		handleRun,
		handleSubmit,
		handleAllSubmitted,
		toggleChat,
		toggleMic,
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
			<div className="flex items-center justify-center h-screen bg-[#171717]">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
					<p className="text-gray-400">Loading collaboration session...</p>
				</div>
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
		<div className="flex flex-col h-screen bg-[#171717] text-gray-200">
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
			<nav className="flex items-center justify-between px-3 py-2 bg-[#2c2c2c] border-b border-gray-700">
				<div className="flex items-center space-x-3">
					<button
						onClick={() => navigate("/explore")}
						className="p-1.5 hover:bg-gray-700 rounded text-gray-400"
					>
						<ChevronLeft size={18} />
					</button>
					<div className="flex items-center space-x-2">
						<Rocket size={18} className="text-purple-500" />
						<span className="font-medium text-white truncate max-w-[200px]">
							{session.problem?.title || "Collaboration"}
						</span>
					</div>

					{/* Connection Status */}
					<div className="flex items-center space-x-1 text-xs">
						{isYjsConnected ? (
							<div className="flex items-center text-green-400">
								<Wifi size={12} className="mr-1" />
								<span className="hidden sm:inline">Live</span>
							</div>
						) : (
							<div className="flex items-center text-yellow-400">
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
								.filter((state) => state.user?.id !== currentUserId)
								.slice(0, 3)
								.map((state, i) => (
									<div
										key={state.user?.id || i}
										className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border-2 border-gray-800"
										style={{ backgroundColor: state.user?.color }}
										title={state.user?.name}
									>
										{state.user?.name?.charAt(0).toUpperCase()}
									</div>
								))}
						</div>
						{remoteCursors.size > 0 && (
							<span className="text-xs text-gray-400 ml-1">
								{remoteCursors.size} online
							</span>
						)}
					</div>

					{/* Timer */}
					<div className="flex items-center space-x-1 px-2 py-1 bg-gray-700 rounded text-sm">
						<Clock
							size={14}
							className={
								seconds < LOW_TIME_THRESHOLD ? "text-red-400" : "text-gray-400"
							}
						/>
						<span
							className={
								seconds < LOW_TIME_THRESHOLD ? "text-red-400" : "text-white"
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
								? "bg-gray-600 text-gray-400 cursor-not-allowed"
								: "bg-gray-700 hover:bg-gray-600 text-white"
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
								? "bg-green-600 text-white cursor-not-allowed"
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
				<div className="flex bg-[#2c2c2c] border-b border-gray-700">
					<button
						className={`flex-1 py-2 text-xs flex items-center justify-center space-x-1 ${
							mobileView === "problem"
								? "bg-purple-500 text-white"
								: "text-gray-400"
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
								: "text-gray-400"
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
								: "text-gray-400"
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
							runTest={handleRun}
							problem={session.problem}
						/>

						{/* Code Editor Section */}
						<div className="flex flex-col flex-1 border-l border-r border-gray-700">
							{/* File Tab */}
							<div className="flex items-center px-3 py-2 bg-[#2c2c2c] border-b border-gray-700">
								<div className="flex items-center space-x-2 px-3 py-1 bg-[#171717] rounded text-sm text-white">
									<Code size={14} className="text-purple-400" />
									<span>{file.filename}</span>
									{isYjsConnected && (
										<span className="text-green-400 text-xs">● Live</span>
									)}
								</div>
								{hasClickedSubmit && !hasSubmitted && (
									<span className="ml-2 text-xs text-yellow-400">
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
							<div className="w-80 flex flex-col bg-[#1a1a1a] border-l border-gray-700">
								<ChatPanel
									messages={chatPanel.messages}
									inputMessage={chatPanel.inputMessage}
									currentUserId={chatPanel.currentUserId}
									messagesEndRef={chatPanel.messagesEndRef}
									isMicOn={isMicOn}
									onMicToggle={toggleMic}
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
									runTest={handleRun}
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
									isMicOn={isMicOn}
									onMicToggle={toggleMic}
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
				<div className="flex items-center justify-between px-4 py-2 bg-[#2c2c2c] border-t border-gray-700 text-xs text-gray-400">
					<div className="flex items-center space-x-4">
						<span className="text-purple-400 font-medium">
							Collaboration Mode
						</span>
						<span>{session.language}</span>
						{isYjsConnected && (
							<span className="text-green-400">● Real-time sync active</span>
						)}
					</div>
					<div className="flex items-center space-x-4">
						<button
							onClick={toggleChat}
							className={`px-2 py-1 rounded ${
								isChatOpen
									? "bg-purple-500/20 text-purple-400"
									: "hover:bg-gray-700"
							}`}
						>
							{isChatOpen ? "Hide Chat" : "Show Chat"}
						</button>
					</div>
				</div>
			)}

			{/* Footer - Mobile */}
			{isMobile && (
				<div className="flex items-center justify-between px-3 py-2 bg-[#2c2c2c] border-t border-gray-700 text-xs">
					<div className="flex items-center space-x-2 text-gray-400">
						<Clock size={12} />
						<span>{timeStr}</span>
						{isYjsConnected && <span className="text-green-400">●</span>}
					</div>
					<div className="flex items-center space-x-2">
						<button
							onClick={handleRun}
							disabled={hasClickedSubmit}
							className={`px-3 py-1.5 rounded text-xs ${
								hasClickedSubmit
									? "bg-gray-600 text-gray-400"
									: "bg-gray-700 text-white"
							}`}
						>
							Run
						</button>
						<button
							onClick={handleSubmit}
							disabled={hasClickedSubmit}
							className={`px-3 py-1.5 rounded text-xs ${
								hasClickedSubmit
									? "bg-green-600 text-white"
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
