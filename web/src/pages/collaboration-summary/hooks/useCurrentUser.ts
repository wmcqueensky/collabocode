import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

interface UseCurrentUserReturn {
	currentUserId: string;
	loading: boolean;
}

export function useCurrentUser(): UseCurrentUserReturn {
	const [currentUserId, setCurrentUserId] = useState<string>("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadUser = async () => {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (user) {
					setCurrentUserId(user.id);
				}
			} finally {
				setLoading(false);
			}
		};
		loadUser();
	}, []);

	return {
		currentUserId,
		loading,
	};
}
