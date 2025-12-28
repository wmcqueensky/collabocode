import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Problem } from "../types/database";

/**
 * Hook to fetch collaboration-specific problems from the database
 * These are problems tagged with 'collaboration' in their tags array
 */
export const useCollaborationProblems = () => {
	const [problems, setProblems] = useState<Problem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchProblems = async () => {
			try {
				setLoading(true);
				setError(null);

				// Fetch problems that have 'collaboration' in their tags
				const { data, error: fetchError } = await supabase
					.from("problems")
					.select("*")
					.eq("is_active", true)
					.contains("tags", ["collaboration"])
					.order("rating", { ascending: false });

				if (fetchError) {
					throw fetchError;
				}

				// If no collaboration-tagged problems exist, fall back to all problems
				if (!data || data.length === 0) {
					console.log("No collaboration problems found, fetching all problems");

					const { data: allProblems, error: allError } = await supabase
						.from("problems")
						.select("*")
						.eq("is_active", true)
						.order("rating", { ascending: false })
						.limit(20);

					if (allError) {
						throw allError;
					}

					setProblems(allProblems || []);
				} else {
					setProblems(data);
				}
			} catch (err: any) {
				console.error("Error fetching collaboration problems:", err);
				setError(err.message || "Failed to load problems");
			} finally {
				setLoading(false);
			}
		};

		fetchProblems();
	}, []);

	return { problems, loading, error };
};

export default useCollaborationProblems;
