import { useState, useEffect } from "react";
import { userService } from "../services/userService";
import type { Profile } from "../types/database";

export const useProfile = () => {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadProfile();
	}, []);

	const loadProfile = async () => {
		try {
			setLoading(true);
			const data = await userService.getCurrentProfile();
			setProfile(data);
			setError(null);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const updateProfile = async (updates: Partial<Profile>) => {
		try {
			await userService.updateProfile(updates);
			await loadProfile();
		} catch (err: any) {
			setError(err.message);
			throw err;
		}
	};

	return { profile, loading, error, updateProfile, reload: loadProfile };
};
