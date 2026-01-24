import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../../contexts/AuthContext";
import { supabase } from "../../../../../lib/supabase";
import { userService } from "../../../../../services/userService";
import type { UserStats, ModalType } from "../types";
import { DEFAULT_USER_STATS } from "../types";

export function useNavbar() {
	const { user, signOut, loading } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	// UI state
	const [showMobileMenu, setShowMobileMenu] = useState(false);
	const [showUserMenu, setShowUserMenu] = useState(false);
	const [activeModal, setActiveModal] = useState<ModalType>(null);

	// Stats state
	const [statsLoading, setStatsLoading] = useState(true);
	const [userStats, setUserStats] = useState<UserStats>(DEFAULT_USER_STATS);

	// Notification signal ref
	const notificationCloseSignal = useRef(0);

	// Close any open modal
	const closeModal = useCallback(() => {
		setActiveModal(null);
	}, []);

	// Open a specific modal (closes any other open modal first and closes notifications)
	const openModal = useCallback((modal: ModalType) => {
		setActiveModal(modal);
		notificationCloseSignal.current += 1;
	}, []);

	// Switch between login and register modals
	const switchToRegister = useCallback(() => {
		setActiveModal("register");
	}, []);

	const switchToLogin = useCallback(() => {
		setActiveModal("login");
	}, []);

	// Fetch user stats
	const fetchUserStats = useCallback(async () => {
		if (!user) return;
		setStatsLoading(true);

		try {
			const stats = await userService.getUserStats(user.id);
			setUserStats(stats);
		} catch (error) {
			console.error("Error fetching user stats:", error);
		} finally {
			setStatsLoading(false);
		}
	}, [user]);

	// Check daily login for streak
	const checkDailyLogin = useCallback(async () => {
		if (!user) return;

		try {
			const lastLoginKey = `lastLogin_${user.id}`;
			const lastLogin = localStorage.getItem(lastLoginKey);
			const today = new Date().toDateString();

			if (lastLogin !== today) {
				const streakResult = await userService.updateDailyStreak(user.id);
				if (streakResult) {
					setUserStats((prev) => ({ ...prev, streak: streakResult.streak }));
					setActiveModal("streak");
				}
				localStorage.setItem(lastLoginKey, today);
			}
		} catch (error) {
			console.error("Error checking daily login:", error);
		}
	}, [user]);

	// Toggle user menu
	const toggleUserMenu = useCallback(() => {
		setShowUserMenu((prev) => !prev);
		notificationCloseSignal.current += 1;
	}, []);

	// Handle logout
	const handleLogout = useCallback(async () => {
		await signOut();
		setShowUserMenu(false);
	}, [signOut]);

	// Handle logo click
	const handleLogoClick = useCallback(() => {
		navigate("/explore");
	}, [navigate]);

	// Toggle mobile menu
	const toggleMobileMenu = useCallback(() => {
		setShowMobileMenu((prev) => !prev);
	}, []);

	// Close mobile menu
	const closeMobileMenu = useCallback(() => {
		setShowMobileMenu(false);
	}, []);

	// Close user menu
	const closeUserMenu = useCallback(() => {
		setShowUserMenu(false);
	}, []);

	// Check if path is active
	const isActive = useCallback(
		(path: string) => location.pathname === path,
		[location.pathname],
	);

	// User stats and profile changes subscription
	useEffect(() => {
		if (user) {
			fetchUserStats();
			checkDailyLogin();

			const channel = supabase
				.channel("profile-changes")
				.on(
					"postgres_changes",
					{
						event: "*",
						schema: "public",
						table: "profiles",
						filter: `id=eq.${user.id}`,
					},
					() => {
						fetchUserStats();
					},
				)
				.subscribe();

			return () => {
				supabase.removeChannel(channel);
			};
		}
	}, [user, fetchUserStats, checkDailyLogin]);

	// Close user menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (showUserMenu && !target.closest("[data-user-menu]")) {
				setShowUserMenu(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [showUserMenu]);

	// Derived values
	const username =
		user?.user_metadata?.username || user?.email?.split("@")[0] || "User";
	const avatarLetter = username[0]?.toUpperCase() || "U";
	const totalSolved = userStats.matchSolved + userStats.collaborationSolved;

	return {
		// Auth state
		user,
		loading,
		username,
		avatarLetter,

		// UI state
		showMobileMenu,
		showUserMenu,
		activeModal,

		// Stats
		statsLoading,
		userStats,
		totalSolved,

		// Notification
		notificationCloseSignal,

		// Modal actions
		openModal,
		closeModal,
		switchToLogin,
		switchToRegister,

		// Menu actions
		toggleUserMenu,
		closeUserMenu,
		toggleMobileMenu,
		closeMobileMenu,

		// Other actions
		handleLogout,
		handleLogoClick,
		isActive,
	};
}
