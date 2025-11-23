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

	async getAllUsers(): Promise<Profile[]> {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("Not authenticated");

		const { data, error } = await supabase
			.from("profiles")
			.select("*")
			.neq("id", user.id)
			.order("username");

		if (error) throw error;
		return data || [];
	},

	// // Search for users by username or full name
	// async searchUsers(query: string): Promise<Profile[]> {
	// 	const {
	// 		data: { user },
	// 	} = await supabase.auth.getUser();
	// 	if (!user) throw new Error("Not authenticated");

	// 	const { data, error } = await supabase
	// 		.from("profiles")
	// 		.select("*")
	// 		.neq("id", user.id)
	// 		.or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
	// 		.order("username")
	// 		.limit(20);

	// 	if (error) throw error;
	// 	return data || [];
	// },

	// Get user profile by ID
	async getUserProfile(userId: string): Promise<Profile | null> {
		const { data, error } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", userId)
			.single();

		if (error) throw error;
		return data;
	},

	// Get current user profile
	async getCurrentUserProfile(): Promise<Profile | null> {
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

	// Update user profile
	// async updateProfile(
	// 	userId: string,
	// 	updates: Partial<Profile>
	// ): Promise<Profile> {
	// 	const { data, error } = await supabase
	// 		.from("profiles")
	// 		.update(updates)
	// 		.eq("id", userId)
	// 		.select()
	// 		.single();

	// 	if (error) throw error;
	// 	return data;
	// },

	// Get multiple profiles by IDs
	async getProfilesByIds(userIds: string[]): Promise<Profile[]> {
		const { data, error } = await supabase
			.from("profiles")
			.select("*")
			.in("id", userIds);

		if (error) {
			console.error("Error fetching profiles:", error);
			return [];
		}

		return data || [];
	},
};
