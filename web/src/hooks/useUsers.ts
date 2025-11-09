import { useState, useEffect } from "react";
import { userService } from "../services/userService";
import type { Profile } from "../types/database";

export const useUsers = () => {
	const [users, setUsers] = useState<Profile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadUsers();
	}, []);

	const loadUsers = async () => {
		try {
			setLoading(true);
			const data = await userService.getAllUsers();
			setUsers(data);
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

	return { users, loading, error, searchUsers, reload: loadUsers };
};
