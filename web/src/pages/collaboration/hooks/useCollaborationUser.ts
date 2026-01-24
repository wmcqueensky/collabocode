import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

interface UseCollaborationUserReturn {
	currentUserId: string;
	currentUserName: string;
	loading: boolean;
}

export function useCollaborationUser(): UseCollaborationUserReturn {
	const [currentUserId, setCurrentUserId] = useState<string>("");
	const [currentUserName, setCurrentUserName] = useState<string>("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				setCurrentUserId(user.id);

				const { data: profile } = await supabase
					.from("profiles")
					.select("username")
					.eq("id", user.id)
					.single();

				setCurrentUserName(
					profile?.username || user.email?.split("@")[0] || "User",
				);
			}

			setLoading(false);
		};
		loadUser();
	}, []);

	return {
		currentUserId,
		currentUserName,
		loading,
	};
}
