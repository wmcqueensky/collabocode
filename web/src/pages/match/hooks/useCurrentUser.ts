import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";

interface UseCurrentUserReturn {
	currentUserId: string;
	currentUsername: string;
	loading: boolean;
}

export const useCurrentUser = (
	redirectOnNotAuth: boolean = true,
): UseCurrentUserReturn => {
	const navigate = useNavigate();
	const [currentUserId, setCurrentUserId] = useState<string>("");
	const [currentUsername, setCurrentUsername] = useState<string>("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (user) {
				setCurrentUserId(user.id);
				setCurrentUsername(
					user.user_metadata?.username || user.email?.split("@")[0] || "User",
				);
			} else if (redirectOnNotAuth) {
				navigate("/explore");
			}

			setLoading(false);
		};

		loadUser();
	}, [navigate, redirectOnNotAuth]);

	return {
		currentUserId,
		currentUsername,
		loading,
	};
};
