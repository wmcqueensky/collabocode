import { useState, useEffect } from "react";
import type { Session } from "../../../types/database";

interface UseCollaborationTimerProps {
	session: Session | null;
	showWaitingLobby: boolean;
	hasClickedSubmit: boolean;
	onTimeUp: () => void;
}

interface UseCollaborationTimerReturn {
	seconds: number;
	timeStr: string;
}

export function useCollaborationTimer({
	session,
	showWaitingLobby,
	hasClickedSubmit,
	onTimeUp,
}: UseCollaborationTimerProps): UseCollaborationTimerReturn {
	const [seconds, setSeconds] = useState(0);
	const [timeStr, setTimeStr] = useState("00:00");

	useEffect(() => {
		if (!session || showWaitingLobby || !session.started_at) return;

		const startTime = new Date(session.started_at).getTime();
		const totalTime = session.time_limit * 60 * 1000;

		const updateTimer = () => {
			const elapsed = Date.now() - startTime;
			const remaining = Math.max(0, totalTime - elapsed);
			const remainingSeconds = Math.floor(remaining / 1000);

			setSeconds(remainingSeconds);
			const mins = Math.floor(remainingSeconds / 60);
			const secs = remainingSeconds % 60;
			setTimeStr(`${mins}:${secs.toString().padStart(2, "0")}`);

			if (remainingSeconds === 0 && !hasClickedSubmit) {
				onTimeUp();
			}
		};

		updateTimer();
		const interval = setInterval(updateTimer, 1000);
		return () => clearInterval(interval);
	}, [session, showWaitingLobby, hasClickedSubmit, onTimeUp]);

	return {
		seconds,
		timeStr,
	};
}
