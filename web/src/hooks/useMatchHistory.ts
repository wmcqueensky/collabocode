import { useState, useEffect } from "react";
import { userService } from "../services/userService";
import type { MatchHistory } from "../types/database";

export const useMatchHistory = (userId?: string) => {
	const [history, setHistory] = useState<MatchHistory[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadHistory();
	}, [userId]);

	const loadHistory = async () => {
		try {
			setLoading(true);
			const data = await userService.getMatchHistory(userId);
			setHistory(data);
			setError(null);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	// Get recent 5 results for display
	const getRecentResults = () => {
		return history.slice(0, 5).map((h) => h.result);
	};

	return { history, loading, error, getRecentResults, reload: loadHistory };
};
