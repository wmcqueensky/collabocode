import { useState, useEffect, useCallback } from "react";
import type { SessionParticipant } from "../../../types/database";
import { calculateProgress } from "../constants";
import type { Participant } from "../types";

interface UseMatchParticipantsProps {
	dbParticipants: SessionParticipant[] | undefined;
	currentUserId: string;
	testCasesLength: number;
}

interface UseMatchParticipantsReturn {
	participants: Participant[];
	updateParticipantProgress: (userId: string, progress: number) => void;
	updateParticipantStatus: (
		userId: string,
		status: Participant["status"],
	) => void;
	markParticipantComplete: (userId: string, isCorrect: boolean) => void;
}

export const useMatchParticipants = ({
	dbParticipants,
	currentUserId,
	testCasesLength,
}: UseMatchParticipantsProps): UseMatchParticipantsReturn => {
	const [participants, setParticipants] = useState<Participant[]>([]);

	// Transform DB participants to UI participants
	useEffect(() => {
		if (!dbParticipants || !currentUserId) return;

		const transformed = dbParticipants
			.filter((p) => p.status === "joined")
			.map((p) => {
				const isCurrentUser = p.user_id === currentUserId;
				const testResults =
					(p.test_results as { passedCount?: number; totalCount?: number }) ||
					{};
				const passedCount = testResults.passedCount || 0;
				const totalCount = testResults.totalCount || testCasesLength;

				const progress = calculateProgress(
					p.is_correct || false,
					passedCount,
					totalCount,
				);

				return {
					id: p.user_id,
					name: isCurrentUser ? "You" : p.user?.username || "Player",
					progress,
					status: p.is_correct ? ("complete" as const) : ("idle" as const),
					finishPosition: p.ranking || null,
					isCorrect: p.is_correct || false,
				};
			});

		setParticipants(transformed);
	}, [dbParticipants, currentUserId, testCasesLength]);

	// Update participant progress
	const updateParticipantProgress = useCallback(
		(userId: string, progress: number) => {
			setParticipants((prev) =>
				prev.map((p) => (p.id === userId ? { ...p, progress } : p)),
			);
		},
		[],
	);

	// Update participant status
	const updateParticipantStatus = useCallback(
		(userId: string, status: Participant["status"]) => {
			setParticipants((prev) =>
				prev.map((p) => (p.id === userId ? { ...p, status } : p)),
			);
		},
		[],
	);

	// Mark participant as complete
	const markParticipantComplete = useCallback(
		(userId: string, isCorrect: boolean) => {
			setParticipants((prev) =>
				prev.map((p) =>
					p.id === userId
						? { ...p, progress: 100, isCorrect, status: "complete" }
						: p,
				),
			);
		},
		[],
	);

	return {
		participants,
		updateParticipantProgress,
		updateParticipantStatus,
		markParticipantComplete,
	};
};
