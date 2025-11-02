import { useState, useEffect } from "react";
import { problemService } from "../services/problemService";
import type { Problem } from "../types/database";

export const useProblems = () => {
	const [problems, setProblems] = useState<Problem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadProblems();
	}, []);

	const loadProblems = async () => {
		try {
			setLoading(true);
			const data = await problemService.getProblems();
			setProblems(data);
			setError(null);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const filterProblems = async (filters: {
		difficulty?: string;
		tags?: string[];
		search?: string;
	}) => {
		try {
			setLoading(true);
			const data = await problemService.filterProblems(filters);
			setProblems(data);
			setError(null);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return { problems, loading, error, filterProblems, reload: loadProblems };
};
