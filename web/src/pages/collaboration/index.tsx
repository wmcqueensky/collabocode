import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Code, Clock, Settings, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { sessionService } from "../../services/sessionService";
import { WaitingLobby } from "../match/lobby/WaitingLobby";
import type { Session, SessionParticipant } from "../../types/database";

export default function CollaborationPage() {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();

	// State
	const [session, setSession] = useState<Session | null>(null);
	const [participants, setParticipants] = useState<SessionParticipant[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentUserId, setCurrentUserId] = useState<string>("");
	const [showWaitingLobby, setShowWaitingLobby] = useState(true);

	// Load current user
	useEffect(() => {
		const loadUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				setCurrentUserId(user.id);
			} else {
				navigate("/explore");
			}
		};
		loadUser();
	}, [navigate]);

	// Load session data
	useEffect(() => {
		if (!sessionId) return;

		const loadSession = async () => {
			try {
				setLoading(true);

				// Fetch session
				const sessionData = await sessionService.getSessionById(sessionId);
				if (!sessionData) {
					setError("Session not found");
					return;
				}

				// Verify this is a collaboration session
				if (sessionData.type !== "collaboration") {
					console.warn("This is not a collaboration session, redirecting...");
					navigate(`/match/${sessionId}`);
					return;
				}

				setSession(sessionData);

				// Fetch participants
				const participantsData = await sessionService.getSessionParticipants(
					sessionId
				);
				setParticipants(participantsData);

				// Determine if we should show waiting lobby
				if (sessionData.status === "in_progress") {
					setShowWaitingLobby(false);
				} else if (sessionData.status === "completed") {
					navigate("/explore");
				}
			} catch (err: any) {
				console.error("Error loading session:", err);
				setError(err.message || "Failed to load session");
			} finally {
				setLoading(false);
			}
		};

		loadSession();
	}, [sessionId, navigate]);

	// Subscribe to real-time updates
	useEffect(() => {
		if (!sessionId) return;

		const channel = supabase
			.channel(`collaboration-session:${sessionId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "session_participants",
					filter: `session_id=eq.${sessionId}`,
				},
				async () => {
					// Reload participants
					const participantsData = await sessionService.getSessionParticipants(
						sessionId
					);
					setParticipants(participantsData);
				}
			)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "sessions",
					filter: `id=eq.${sessionId}`,
				},
				async (payload) => {
					const updatedSession = payload.new as any;
					setSession((prev) => (prev ? { ...prev, ...updatedSession } : null));

					if (updatedSession.status === "in_progress") {
						setShowWaitingLobby(false);
					} else if (updatedSession.status === "completed") {
						navigate(`/collaboration-summary/${sessionId}`);
					}
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [sessionId, navigate]);

	// Handle starting the session (host only)
	const handleStartSession = async () => {
		if (!session || !sessionId) return;

		try {
			await sessionService.updateSessionStatus(sessionId, "in_progress");
			setShowWaitingLobby(false);
		} catch (err: any) {
			console.error("Error starting session:", err);
			setError(err.message || "Failed to start session");
		}
	};

	// Handle leaving the session
	const handleLeaveSession = async () => {
		if (!sessionId || !currentUserId) return;

		try {
			await sessionService.updateParticipantStatus(
				sessionId,
				currentUserId,
				"left"
			);
			navigate("/explore");
		} catch (err: any) {
			console.error("Error leaving session:", err);
		}
	};

	// Loading state
	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen bg-[#171717]">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
					className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
				>
					<ArrowLeft size={18} />
					Back to Explore
				</button>
			</div>
		);
	}

	// Show waiting lobby if session hasn't started
	if (showWaitingLobby) {
		return (
			<WaitingLobby
				session={session}
				participants={participants}
				currentUserId={currentUserId}
				onStartSession={handleStartSession}
			/>
		);
	}

	// Main collaboration view (placeholder for now)
	return (
		<div className="min-h-screen bg-[#171717] text-white">
			{/* Header */}
			<header className="bg-[#1f1f1f] border-b border-gray-700 px-4 py-3">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<div className="flex items-center gap-4">
						<button
							onClick={handleLeaveSession}
							className="text-gray-400 hover:text-white transition"
						>
							<ArrowLeft size={20} />
						</button>
						<div>
							<h1 className="text-xl font-bold flex items-center gap-2">
								<Users size={20} className="text-purple-500" />
								Collaboration Session
							</h1>
							<p className="text-sm text-gray-400">{session.problem?.title}</p>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 text-sm text-gray-400">
							<Clock size={16} />
							<span>{session.time_limit} min</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-gray-400">
							<Code size={16} />
							<span className="capitalize">{session.language}</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-gray-400">
							<Users size={16} />
							<span>
								{participants.filter((p) => p.status === "joined").length}/
								{session.max_players}
							</span>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content Area */}
			<main className="p-4 max-w-7xl mx-auto">
				{/* Session Info Card */}
				<div className="bg-[#1f1f1f] border border-gray-700 rounded-xl p-6 mb-6">
					<div className="flex items-start justify-between mb-4">
						<div>
							<h2 className="text-2xl font-bold text-white mb-2">
								{session.problem?.title || "Collaboration Project"}
							</h2>
							<p className="text-gray-400 max-w-2xl">
								{session.problem?.description || "No description available."}
							</p>
						</div>
						<span
							className={`px-3 py-1 rounded-full text-sm font-medium ${
								session.problem?.difficulty === "Easy"
									? "bg-green-500/20 text-green-400"
									: session.problem?.difficulty === "Medium"
									? "bg-yellow-500/20 text-yellow-400"
									: "bg-red-500/20 text-red-400"
							}`}
						>
							{session.problem?.difficulty || "Medium"}
						</span>
					</div>

					{/* Tags */}
					{session.problem?.tags && session.problem.tags.length > 0 && (
						<div className="flex flex-wrap gap-2 mb-4">
							{session.problem.tags
								.filter((tag) => tag !== "collaboration")
								.map((tag, index) => (
									<span
										key={index}
										className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs"
									>
										{tag}
									</span>
								))}
						</div>
					)}

					{/* Session Description */}
					{session.description && (
						<div className="mt-4 p-3 bg-[#2a2a2a] rounded-lg">
							<p className="text-sm text-gray-300">
								<span className="text-gray-500">Session goal: </span>
								{session.description}
							</p>
						</div>
					)}
				</div>

				{/* Collaborators */}
				<div className="bg-[#1f1f1f] border border-gray-700 rounded-xl p-6 mb-6">
					<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
						<Users size={18} className="text-purple-500" />
						Collaborators
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{participants
							.filter((p) => p.status === "joined")
							.map((participant) => (
								<div
									key={participant.id}
									className={`p-4 rounded-lg border ${
										participant.user_id === currentUserId
											? "border-purple-500 bg-purple-500/10"
											: "border-gray-700 bg-[#2a2a2a]"
									}`}
								>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
											{participant.user?.username?.charAt(0).toUpperCase() ||
												"?"}
										</div>
										<div>
											<p className="font-medium text-white">
												{participant.user?.username || "Unknown"}
												{participant.user_id === currentUserId && (
													<span className="text-purple-400 ml-2">(You)</span>
												)}
											</p>
											<p className="text-xs text-gray-400">
												{participant.role === "host" ? "Host" : "Collaborator"}
											</p>
										</div>
									</div>
								</div>
							))}
					</div>
				</div>

				{/* Placeholder for collaborative editor */}
				<div className="bg-[#1f1f1f] border border-gray-700 rounded-xl p-6">
					<div className="flex items-center justify-center h-96">
						<div className="text-center">
							<Settings
								size={64}
								className="text-gray-600 mx-auto mb-4 animate-spin-slow"
							/>
							<h3 className="text-xl font-semibold text-gray-400 mb-2">
								Collaborative Editor Coming Soon
							</h3>
							<p className="text-gray-500 max-w-md">
								The real-time collaborative coding environment is being built.
								You'll be able to code together with your team in real-time!
							</p>
						</div>
					</div>
				</div>

				{/* Session Actions */}
				<div className="mt-6 flex justify-end gap-4">
					<button
						onClick={handleLeaveSession}
						className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
					>
						Leave Session
					</button>
					{session.host_id === currentUserId && (
						<button
							onClick={() =>
								sessionService.updateSessionStatus(sessionId!, "completed")
							}
							className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
						>
							End Collaboration
						</button>
					)}
				</div>
			</main>
		</div>
	);
}
