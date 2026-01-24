import { useState, useEffect } from "react";
import { formatTime } from "../constants";

interface UseMatchTimerProps {
	initialSeconds: number;
	started: boolean;
	onTimeUp?: () => void;
}

interface UseMatchTimerReturn {
	seconds: number;
	timeStr: string;
	isExpired: boolean;
}

export const useMatchTimer = ({
	initialSeconds,
	started,
	onTimeUp,
}: UseMatchTimerProps): UseMatchTimerReturn => {
	const [seconds, setSeconds] = useState(initialSeconds);
	const [timeStr, setTimeStr] = useState(formatTime(initialSeconds));
	const [isExpired, setIsExpired] = useState(false);

	// Update seconds when initialSeconds changes
	useEffect(() => {
		setSeconds(initialSeconds);
		setTimeStr(formatTime(initialSeconds));
	}, [initialSeconds]);

	// Timer countdown
	useEffect(() => {
		if (!started || seconds <= 0) return;

		const timer = setInterval(() => {
			setSeconds((prevSeconds) => {
				const newSeconds = Math.max(0, prevSeconds - 1);
				setTimeStr(formatTime(newSeconds));

				if (newSeconds === 0) {
					setIsExpired(true);
					onTimeUp?.();
				}

				return newSeconds;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [started, seconds, onTimeUp]);

	return {
		seconds,
		timeStr,
		isExpired,
	};
};
