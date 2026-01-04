import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Problem } from "../types/database";

/**
 * Hook to fetch problems from the database
 * Returns all active problems - can be used for both match and collaboration modes
 */
export const useProblems = () => {
	const [problems, setProblems] = useState<Problem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchProblems = async () => {
			try {
				setLoading(true);
				setError(null);

				// Fetch all active problems
				const { data, error: fetchError } = await supabase
					.from("problems")
					.select("*")
					.eq("is_active", true)
					.order("rating", { ascending: false });

				if (fetchError) {
					throw fetchError;
				}

				setProblems(data || []);
			} catch (err: any) {
				console.error("Error fetching problems:", err);
				setError(err.message || "Failed to load problems");
			} finally {
				setLoading(false);
			}
		};

		fetchProblems();
	}, []);

	return { problems, loading, error };
};

export default useProblems;
