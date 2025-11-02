import { supabase } from "../lib/supabase";
import type { Profile, MatchHistory } from "../types/database";

export const userService = {
	// Get current user profile
	async getCurrentProfile(): Promise<Profile | null> {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return null;

		const { data, error } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", user.id)
			.single();

		if (error) throw error;
		return data;
	},

	// Get user profile by ID
	async getProfileById(id: string): Promise<Profile | null> {
		const { data, error } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", id)
			.single();

		if (error) throw error;
		return data;
	},

	// Search users
	async searchUsers(query: string): Promise<Profile[]> {
		const { data, error } = await supabase
			.from("profiles")
			.select("*")
			.or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
			.limit(20);

		if (error) throw error;
		return data || [];
	},

	// Get friends (accepted friendships)
	async getFriends(): Promise<Profile[]> {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return [];

		const { data, error } = await supabase
			.from("friendships")
			.select(
				`
        friend:profiles!friendships_friend_id_fkey(*)
      `
			)
			.eq("user_id", user.id)
			.eq("status", "accepted");

		if (error) throw error;
		return data?.map((f: any) => f.friend) || [];
	},

	// Get user match history
	async getMatchHistory(userId?: string): Promise<MatchHistory[]> {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		const targetUserId = userId || user?.id;

		if (!targetUserId) return [];

		const { data, error } = await supabase
			.from("match_history")
			.select("*")
			.eq("user_id", targetUserId)
			.order("created_at", { ascending: false })
			.limit(10);

		if (error) throw error;
		return data || [];
	},

	// Update user profile
	async updateProfile(updates: Partial<Profile>): Promise<void> {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("Not authenticated");

		const { error } = await supabase
			.from("profiles")
			.update(updates)
			.eq("id", user.id);

		if (error) throw error;
	},
};
