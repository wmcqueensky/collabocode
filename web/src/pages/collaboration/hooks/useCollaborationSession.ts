import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { sessionService } from "../../../services/sessionService";
import type { Session, SessionParticipant } from "../../../types/database";

interface UseCollaborationSessionProps {
	sessionId: string | undefined;
	currentUserId: string;
}

interface UseCollaborationSessionReturn {
	session: Session | null;
	participants: SessionParticipant[];
	loading: boolean;
	error: string | null;
	showWaitingLobby: boolean;
	testCases: any[];
	starterCode: string;
	hasClickedSubmit: boolean;
	hasSubmitted: boolean;
	setShowWaitingLobby: (show: boolean) => void;
	setHasClickedSubmit: (show: boolean) => void;
	setHasSubmitted: (show: boolean) => void;
	handleStartSession: () => Promise<void>;
}

export function useCollaborationSession({
	sessionId,
	currentUserId,
}: UseCollaborationSessionProps): UseCollaborationSessionReturn {
	const navigate = useNavigate();

	const [session, setSession] = useState<Session | null>(null);
	const [participants, setParticipants] = useState<SessionParticipant[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showWaitingLobby, setShowWaitingLobby] = useState(true);
	const [testCases, setTestCases] = useState<any[]>([]);
	const [starterCode, setStarterCode] = useState<string>("");
	const [hasClickedSubmit, setHasClickedSubmit] = useState(false);
	const [hasSubmitted, setHasSubmitted] = useState(false);

	// Load session data
	useEffect(() => {
		if (!sessionId || !currentUserId) return;

		const loadSession = async () => {
			try {
				setLoading(true);

				const sessionData = await sessionService.getSessionById(sessionId);
				if (!sessionData) {
					setError("Session not found");
					return;
				}

				if (sessionData.type !== "collaboration") {
					navigate(`/match/${sessionId}`);
					return;
				}

				setSession(sessionData);

				const participantsData =
					await sessionService.getSessionParticipants(sessionId);
				setParticipants(participantsData);

				// Check if current user has already marked ready_to_submit
				const currentParticipant = participantsData.find(
					(p) => p.user_id === currentUserId,
				);
				if (currentParticipant?.submission_time) {
					const testResults = currentParticipant.test_results as any;
					if (testResults?.ready_to_submit && !testResults?.final_submission) {
						setHasClickedSubmit(true);
					} else if (testResults?.final_submission) {
						setHasSubmitted(true);
					}
				}

				if (sessionData.status === "in_progress") {
					setShowWaitingLobby(false);
				} else if (sessionData.status === "completed") {
					navigate(`/collaboration-summary/${sessionId}`);
					return;
				}

				if (sessionData.problem?.test_cases) {
					const cases = sessionData.problem.test_cases.map((tc: any) => ({
						input: tc.input,
						output: tc.output,
						status: "pending" as const,
					}));
					setTestCases(cases);
				}

				if (sessionData.problem?.starter_code) {
					const code =
						sessionData.problem.starter_code[sessionData.language] ||
						sessionData.problem.starter_code.javascript ||
						"// Start coding here";
					setStarterCode(code);
				}
			} catch (err: any) {
				console.error("Error loading session:", err);
				setError(err.message || "Failed to load session");
			} finally {
				setLoading(false);
			}
		};

		loadSession();
	}, [sessionId, currentUserId, navigate]);

	// Subscribe to real-time participant updates
	useEffect(() => {
		if (!sessionId || showWaitingLobby) return;

		const participantChannel = supabase
			.channel(`collaboration-participants:${sessionId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "session_participants",
					filter: `session_id=eq.${sessionId}`,
				},
				async () => {
					const updated =
						await sessionService.getSessionParticipants(sessionId);
					setParticipants(updated);
				},
			)
			.subscribe();

		const sessionChannel = supabase
			.channel(`collaboration-session:${sessionId}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "sessions",
					filter: `id=eq.${sessionId}`,
				},
				(payload) => {
					const updated = payload.new as Session;
					setSession((prev) => (prev ? { ...prev, ...updated } : null));

					if (updated.status === "completed") {
						navigate(`/collaboration-summary/${sessionId}`);
					}
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(participantChannel);
			supabase.removeChannel(sessionChannel);
		};
	}, [sessionId, showWaitingLobby, navigate]);

	const handleStartSession = async () => {
		if (!session || !sessionId) return;

		try {
			await sessionService.updateSessionStatus(sessionId, "in_progress");

			const updatedSession = await sessionService.getSessionById(sessionId);
			if (updatedSession) {
				setSession(updatedSession);
			}

			setShowWaitingLobby(false);
		} catch (err: any) {
			console.error("Error starting session:", err);
			setError(err.message || "Failed to start session");
		}
	};

	return {
		session,
		participants,
		loading,
		error,
		showWaitingLobby,
		testCases,
		starterCode,
		hasClickedSubmit,
		hasSubmitted,
		setShowWaitingLobby,
		setHasClickedSubmit,
		setHasSubmitted,
		handleStartSession,
	};
}
