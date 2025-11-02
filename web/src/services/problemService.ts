import { supabase } from "../lib/supabase";
import type { Problem } from "../types/database";

export const problemService = {
	// Get all active problems
	async getProblems(): Promise<Problem[]> {
		const { data, error } = await supabase
			.from("problems")
			.select("*")
			.eq("is_active", true)
			.order("created_at", { ascending: false });

		if (error) throw error;
		return data || [];
	},

	// Get problem by ID
	async getProblemById(id: string): Promise<Problem | null> {
		const { data, error } = await supabase
			.from("problems")
			.select("*")
			.eq("id", id)
			.single();

		if (error) throw error;
		return data;
	},

	// Filter problems
	async filterProblems(filters: {
		difficulty?: string;
		tags?: string[];
		search?: string;
	}): Promise<Problem[]> {
		let query = supabase.from("problems").select("*").eq("is_active", true);

		if (filters.difficulty && filters.difficulty !== "all") {
			query = query.eq("difficulty", filters.difficulty);
		}

		if (filters.tags && filters.tags.length > 0) {
			query = query.contains("tags", filters.tags);
		}

		if (filters.search) {
			query = query.or(
				`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
			);
		}

		const { data, error } = await query.order("rating", { ascending: false });

		if (error) throw error;
		return data || [];
	},
};
