import { useState, useEffect } from "react";
import { userService } from "../services/userService";
import type { Profile } from "../types/database";

export const useFriends = () => {
	const [friends, setFriends] = useState<Profile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadFriends();
	}, []);

	const loadFriends = async () => {
		try {
			setLoading(true);
			const data = await userService.getFriends();
			setFriends(data);
			setError(null);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const searchUsers = async (query: string) => {
		try {
			const data = await userService.searchUsers(query);
			return data;
		} catch (err: any) {
			setError(err.message);
			return [];
		}
	};

	return { friends, loading, error, searchUsers, reload: loadFriends };
};
