import { supabase } from "../lib/supabase";
import type { Profile, SessionHistory, SessionType } from "../types/database";

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
			.select(`friend:profiles!friendships_friend_id_fkey(*)`)
			.eq("user_id", user.id)
			.eq("status", "accepted");

		if (error) throw error;
		return data?.map((f: any) => f.friend) || [];
	},

	// Get user session history (supports both match and collaboration)
	async getSessionHistory(
		userId?: string,
		type?: SessionType
	): Promise<SessionHistory[]> {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		const targetUserId = userId || user?.id;

		if (!targetUserId) return [];

		let query = supabase
			.from("session_history")
			.select("*")
			.eq("user_id", targetUserId)
			.order("created_at", { ascending: false })
			.limit(20);

		if (type) {
			query = query.eq("type", type);
		}

		const { data, error } = await query;

		// Fallback to match_history if session_history doesn't exist
		if (error && error.code === "42P01") {
			const { data: fallbackData, error: fallbackError } = await supabase
				.from("match_history")
				.select("*")
				.eq("user_id", targetUserId)
				.order("created_at", { ascending: false })
				.limit(20);

			if (fallbackError) throw fallbackError;
			return fallbackData || [];
		}

		if (error) throw error;
		return data || [];
	},

	// Alias for backward compatibility
	async getMatchHistory(userId?: string): Promise<SessionHistory[]> {
		return this.getSessionHistory(userId, "match");
	},

	// Get collaboration history
	async getCollaborationHistory(userId?: string): Promise<SessionHistory[]> {
		return this.getSessionHistory(userId, "collaboration");
	},

	// Update user profile
	async updateProfile(updates: Partial<Profile>): Promise<void> {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) throw new Error("Not authenticated");

		const { error } = await supabase
			.from("profiles")
			.update({
				...updates,
				updated_at: new Date().toISOString(),
			})
			.eq("id", user.id);

		if (error) throw error;
	},

	// Update rating for specific mode
	async updateRating(
		userId: string,
		type: SessionType,
		ratingChange: number
	): Promise<void> {
		const profile = await this.getProfileById(userId);
		if (!profile) throw new Error("Profile not found");

		const updates: Partial<Profile> = {};

		if (type === "match") {
			updates.match_rating = Math.max(0, profile.match_rating + ratingChange);
			// Also update legacy field for backward compatibility
			updates.rating = updates.match_rating;
		} else {
			updates.collaboration_rating = Math.max(
				0,
				profile.collaboration_rating + ratingChange
			);
		}

		const { error } = await supabase
			.from("profiles")
			.update(updates)
			.eq("id", userId);

		if (error) throw error;
	},

	// Increment solved count for specific mode
	async incrementSolved(userId: string, type: SessionType): Promise<void> {
		const profile = await this.getProfileById(userId);
		if (!profile) throw new Error("Profile not found");

		const updates: Partial<Profile> = {};

		if (type === "match") {
			updates.match_solved = profile.match_solved + 1;
			// Also update legacy field for backward compatibility
			updates.problems_solved = profile.problems_solved + 1;
		} else {
			updates.collaboration_solved = profile.collaboration_solved + 1;
		}

		const { error } = await supabase
			.from("profiles")
			.update(updates)
			.eq("id", userId);

		if (error) throw error;
	},

	// Get all users (excluding current user)
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

	// Get user profile by ID (alias)
	async getUserProfile(userId: string): Promise<Profile | null> {
		return this.getProfileById(userId);
	},

	// Get current user profile (alias)
	async getCurrentUserProfile(): Promise<Profile | null> {
		return this.getCurrentProfile();
	},

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

	// Update daily streak - called when user logs in for the day
	async updateDailyStreak(
		userId: string
	): Promise<{ streak: number; isNewDay: boolean } | null> {
		try {
			const { data: profile, error: fetchError } = await supabase
				.from("profiles")
				.select("streak, last_login_date")
				.eq("id", userId)
				.single();

			if (fetchError) {
				console.error("Error fetching profile for streak:", fetchError);
				return null;
			}

			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const todayStr = today.toISOString().split("T")[0];

			const lastLoginDate = profile?.last_login_date
				? new Date(profile.last_login_date)
				: null;
			if (lastLoginDate) {
				lastLoginDate.setHours(0, 0, 0, 0);
			}

			const lastLoginStr = lastLoginDate
				? lastLoginDate.toISOString().split("T")[0]
				: null;

			// If already logged in today, return current streak
			if (lastLoginStr === todayStr) {
				return { streak: profile?.streak || 0, isNewDay: false };
			}

			let newStreak = 1;

			if (lastLoginDate) {
				const yesterday = new Date(today);
				yesterday.setDate(yesterday.getDate() - 1);
				const yesterdayStr = yesterday.toISOString().split("T")[0];

				// If last login was yesterday, increment streak
				if (lastLoginStr === yesterdayStr) {
					newStreak = (profile?.streak || 0) + 1;
				}
				// Otherwise, streak resets to 1
			}

			// Update profile with new streak and last login date
			const { error: updateError } = await supabase
				.from("profiles")
				.update({
					streak: newStreak,
					last_login_date: todayStr,
					updated_at: new Date().toISOString(),
				})
				.eq("id", userId);

			if (updateError) {
				console.error("Error updating streak:", updateError);
				return null;
			}

			return { streak: newStreak, isNewDay: true };
		} catch (error) {
			console.error("Error in updateDailyStreak:", error);
			return null;
		}
	},

	// Get user statistics for both modes
	async getUserStats(userId?: string): Promise<{
		matchRating: number;
		collaborationRating: number;
		matchSolved: number;
		collaborationSolved: number;
		streak: number;
	}> {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		const targetUserId = userId || user?.id;

		if (!targetUserId) {
			return {
				matchRating: 1500,
				collaborationRating: 1500,
				matchSolved: 0,
				collaborationSolved: 0,
				streak: 0,
			};
		}

		const { data: profile, error } = await supabase
			.from("profiles")
			.select(
				"match_rating, collaboration_rating, match_solved, collaboration_solved, rating, problems_solved, streak, last_login_date"
			)
			.eq("id", targetUserId)
			.single();

		if (error) {
			console.error("Error fetching user stats:", error);
			return {
				matchRating: 1500,
				collaborationRating: 1500,
				matchSolved: 0,
				collaborationSolved: 0,
				streak: 0,
			};
		}

		// Verify streak is still valid (hasn't been broken)
		let currentStreak = profile?.streak || 0;
		if (profile?.last_login_date) {
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			const lastLogin = new Date(profile.last_login_date);
			lastLogin.setHours(0, 0, 0, 0);

			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);

			// If last login wasn't today or yesterday, streak is broken
			if (
				lastLogin.getTime() !== today.getTime() &&
				lastLogin.getTime() !== yesterday.getTime()
			) {
				currentStreak = 0;
			}
		}

		return {
			matchRating: profile?.match_rating ?? profile?.rating ?? 1500,
			collaborationRating: profile?.collaboration_rating ?? 1500,
			matchSolved: profile?.match_solved ?? profile?.problems_solved ?? 0,
			collaborationSolved: profile?.collaboration_solved ?? 0,
			streak: currentStreak,
		};
	},

	// Legacy helper function to calculate streak from history (deprecated)
	calculateStreak(
		matches: Array<{ created_at: string; completed: boolean }>
	): number {
		if (!matches || matches.length === 0) return 0;

		let streak = 0;
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		for (let i = 0; i < matches.length; i++) {
			const matchDate = new Date(matches[i].created_at);
			matchDate.setHours(0, 0, 0, 0);

			const expectedDate = new Date(today);
			expectedDate.setDate(today.getDate() - i);

			if (matchDate.getTime() === expectedDate.getTime()) {
				streak++;
			} else {
				break;
			}
		}

		return streak;
	},
};
