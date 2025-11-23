import { useState, useEffect } from "react";
import {
	User,
	Bell,
	Lock,
	Palette,
	Globe,
	Shield,
	Mail,
	Check,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

type SettingsTab =
	| "account"
	| "appearance"
	| "notifications"
	| "privacy"
	| "language";

const SettingsPage = () => {
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState<SettingsTab>("account");
	const [loading, setLoading] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);

	// Account Settings
	const [username, setUsername] = useState("");
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");

	// Appearance Settings
	const [theme, setTheme] = useState("dark");
	const [codeTheme, setCodeTheme] = useState("monokai");
	const [fontSize, setFontSize] = useState("medium");

	// Notification Settings
	const [emailNotifications, setEmailNotifications] = useState(true);
	const [matchInvites, setMatchInvites] = useState(true);
	const [matchResults, setMatchResults] = useState(true);
	const [systemUpdates, setSystemUpdates] = useState(false);

	// Privacy Settings
	const [profileVisibility, setProfileVisibility] = useState("public");
	const [showEmail, setShowEmail] = useState(false);
	const [showStats, setShowStats] = useState(true);

	// Language Settings
	const [language, setLanguage] = useState("en");
	const [timezone, setTimezone] = useState("UTC");

	useEffect(() => {
		if (user) {
			loadUserSettings();
		}
	}, [user]);

	const loadUserSettings = async () => {
		if (!user) return;

		try {
			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", user.id)
				.single();

			if (error) throw error;

			if (data) {
				setUsername(data.username || "");
				setFullName(data.full_name || "");
				setEmail(user.email || "");
			}
		} catch (error) {
			console.error("Error loading settings:", error);
		}
	};

	const saveAccountSettings = async () => {
		if (!user) return;

		setLoading(true);
		try {
			const { error } = await supabase
				.from("profiles")
				.update({
					username,
					full_name: fullName,
					updated_at: new Date().toISOString(),
				})
				.eq("id", user.id);

			if (error) throw error;

			setSaveSuccess(true);
			setTimeout(() => setSaveSuccess(false), 3000);
		} catch (error) {
			console.error("Error saving settings:", error);
			alert("Failed to save settings. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const saveAppearanceSettings = () => {
		setLoading(true);
		// Save to localStorage or backend
		localStorage.setItem("theme", theme);
		localStorage.setItem("codeTheme", codeTheme);
		localStorage.setItem("fontSize", fontSize);

		setTimeout(() => {
			setLoading(false);
			setSaveSuccess(true);
			setTimeout(() => setSaveSuccess(false), 3000);
		}, 500);
	};

	const saveNotificationSettings = () => {
		setLoading(true);
		// Save to localStorage or backend
		localStorage.setItem(
			"notifications",
			JSON.stringify({
				emailNotifications,
				matchInvites,
				matchResults,
				systemUpdates,
			})
		);

		setTimeout(() => {
			setLoading(false);
			setSaveSuccess(true);
			setTimeout(() => setSaveSuccess(false), 3000);
		}, 500);
	};

	const savePrivacySettings = () => {
		setLoading(true);
		// Save to localStorage or backend
		localStorage.setItem(
			"privacy",
			JSON.stringify({
				profileVisibility,
				showEmail,
				showStats,
			})
		);

		setTimeout(() => {
			setLoading(false);
			setSaveSuccess(true);
			setTimeout(() => setSaveSuccess(false), 3000);
		}, 500);
	};

	const saveLanguageSettings = () => {
		setLoading(true);
		// Save to localStorage or backend
		localStorage.setItem("language", language);
		localStorage.setItem("timezone", timezone);

		setTimeout(() => {
			setLoading(false);
			setSaveSuccess(true);
			setTimeout(() => setSaveSuccess(false), 3000);
		}, 500);
	};

	const handleSave = () => {
		switch (activeTab) {
			case "account":
				saveAccountSettings();
				break;
			case "appearance":
				saveAppearanceSettings();
				break;
			case "notifications":
				saveNotificationSettings();
				break;
			case "privacy":
				savePrivacySettings();
				break;
			case "language":
				saveLanguageSettings();
				break;
		}
	};

	const tabs = [
		{ id: "account", label: "Account", icon: User },
		{ id: "appearance", label: "Appearance", icon: Palette },
		{ id: "notifications", label: "Notifications", icon: Bell },
		{ id: "privacy", label: "Privacy", icon: Shield },
		{ id: "language", label: "Language & Region", icon: Globe },
	];

	return (
		<div className="min-h-screen bg-[#0f0f0f] text-white">
			<div className="max-w-6xl mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2">Settings</h1>
					<p className="text-gray-400">
						Manage your account settings and preferences
					</p>
				</div>

				<div className="flex flex-col md:flex-row gap-6">
					{/* Sidebar */}
					<div className="w-full md:w-64 bg-[#1a1a1a] rounded-lg border border-gray-800 p-2 h-fit">
						<nav className="space-y-1">
							{tabs.map((tab) => {
								const Icon = tab.icon;
								return (
									<button
										key={tab.id}
										onClick={() => setActiveTab(tab.id as SettingsTab)}
										className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
											activeTab === tab.id
												? "bg-[#5bc6ca] bg-opacity-10 text-[#5bc6ca]"
												: "text-gray-400 hover:bg-gray-800 hover:text-white"
										}`}
									>
										<Icon size={20} />
										<span className="text-sm font-medium">{tab.label}</span>
									</button>
								);
							})}
						</nav>
					</div>

					{/* Content */}
					<div className="flex-1 bg-[#1a1a1a] rounded-lg border border-gray-800 p-6">
						{/* Account Settings */}
						{activeTab === "account" && (
							<div className="space-y-6">
								<div>
									<h2 className="text-xl font-semibold mb-1">
										Account Information
									</h2>
									<p className="text-sm text-gray-400">
										Update your account details
									</p>
								</div>

								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2">
											Username
										</label>
										<input
											type="text"
											value={username}
											onChange={(e) => setUsername(e.target.value)}
											className="w-full px-4 py-2 bg-[#252525] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#5bc6ca] focus:border-transparent"
											placeholder="Enter username"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2">
											Full Name
										</label>
										<input
											type="text"
											value={fullName}
											onChange={(e) => setFullName(e.target.value)}
											className="w-full px-4 py-2 bg-[#252525] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#5bc6ca] focus:border-transparent"
											placeholder="Enter full name"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2">
											Email
										</label>
										<div className="relative">
											<input
												type="email"
												value={email}
												disabled
												className="w-full px-4 py-2 bg-[#252525] border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
											/>
											<Mail
												className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
												size={18}
											/>
										</div>
										<p className="text-xs text-gray-500 mt-1">
											Email cannot be changed directly. Contact support for
											assistance.
										</p>
									</div>

									<div className="pt-4 border-t border-gray-700">
										<h3 className="text-lg font-medium mb-3">Password</h3>
										<button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center space-x-2">
											<Lock size={16} />
											<span>Change Password</span>
										</button>
									</div>
								</div>
							</div>
						)}

						{/* Appearance Settings */}
						{activeTab === "appearance" && (
							<div className="space-y-6">
								<div>
									<h2 className="text-xl font-semibold mb-1">
										Appearance Settings
									</h2>
									<p className="text-sm text-gray-400">
										Customize how CollaboCode looks
									</p>
								</div>

								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2">
											Theme
										</label>
										<div className="grid grid-cols-2 gap-3">
											<button
												onClick={() => setTheme("dark")}
												className={`p-4 rounded-lg border-2 transition-all ${
													theme === "dark"
														? "border-[#5bc6ca] bg-[#5bc6ca] bg-opacity-10"
														: "border-gray-700 bg-[#252525] hover:border-gray-600"
												}`}
											>
												<div className="flex items-center justify-between mb-2">
													<span className="font-medium">Dark</span>
													{theme === "dark" && (
														<Check size={18} className="text-[#5bc6ca]" />
													)}
												</div>
												<div className="h-16 bg-[#0f0f0f] rounded border border-gray-700"></div>
											</button>

											<button
												onClick={() => setTheme("light")}
												className={`p-4 rounded-lg border-2 transition-all ${
													theme === "light"
														? "border-[#5bc6ca] bg-[#5bc6ca] bg-opacity-10"
														: "border-gray-700 bg-[#252525] hover:border-gray-600"
												}`}
											>
												<div className="flex items-center justify-between mb-2">
													<span className="font-medium">Light</span>
													{theme === "light" && (
														<Check size={18} className="text-[#5bc6ca]" />
													)}
												</div>
												<div className="h-16 bg-gray-100 rounded border border-gray-300"></div>
											</button>
										</div>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2">
											Code Editor Theme
										</label>
										<select
											value={codeTheme}
											onChange={(e) => setCodeTheme(e.target.value)}
											className="w-full px-4 py-2 bg-[#252525] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#5bc6ca] focus:border-transparent"
										>
											<option value="monokai">Monokai</option>
											<option value="github-dark">GitHub Dark</option>
											<option value="dracula">Dracula</option>
											<option value="nord">Nord</option>
											<option value="solarized-dark">Solarized Dark</option>
										</select>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2">
											Font Size
										</label>
										<div className="flex items-center space-x-3">
											<button
												onClick={() => setFontSize("small")}
												className={`px-4 py-2 rounded-lg border transition-all ${
													fontSize === "small"
														? "border-[#5bc6ca] bg-[#5bc6ca] bg-opacity-10 text-[#5bc6ca]"
														: "border-gray-700 bg-[#252525] text-gray-400 hover:border-gray-600"
												}`}
											>
												Small
											</button>
											<button
												onClick={() => setFontSize("medium")}
												className={`px-4 py-2 rounded-lg border transition-all ${
													fontSize === "medium"
														? "border-[#5bc6ca] bg-[#5bc6ca] bg-opacity-10 text-[#5bc6ca]"
														: "border-gray-700 bg-[#252525] text-gray-400 hover:border-gray-600"
												}`}
											>
												Medium
											</button>
											<button
												onClick={() => setFontSize("large")}
												className={`px-4 py-2 rounded-lg border transition-all ${
													fontSize === "large"
														? "border-[#5bc6ca] bg-[#5bc6ca] bg-opacity-10 text-[#5bc6ca]"
														: "border-gray-700 bg-[#252525] text-gray-400 hover:border-gray-600"
												}`}
											>
												Large
											</button>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Notification Settings */}
						{activeTab === "notifications" && (
							<div className="space-y-6">
								<div>
									<h2 className="text-xl font-semibold mb-1">
										Notification Preferences
									</h2>
									<p className="text-sm text-gray-400">
										Choose what notifications you want to receive
									</p>
								</div>

								<div className="space-y-4">
									<div className="flex items-center justify-between py-3 border-b border-gray-700">
										<div>
											<p className="font-medium">Email Notifications</p>
											<p className="text-sm text-gray-400">
												Receive notifications via email
											</p>
										</div>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={emailNotifications}
												onChange={(e) =>
													setEmailNotifications(e.target.checked)
												}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#5bc6ca] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5bc6ca]"></div>
										</label>
									</div>

									<div className="flex items-center justify-between py-3 border-b border-gray-700">
										<div>
											<p className="font-medium">Match Invitations</p>
											<p className="text-sm text-gray-400">
												Get notified when someone invites you to a match
											</p>
										</div>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={matchInvites}
												onChange={(e) => setMatchInvites(e.target.checked)}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#5bc6ca] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5bc6ca]"></div>
										</label>
									</div>

									<div className="flex items-center justify-between py-3 border-b border-gray-700">
										<div>
											<p className="font-medium">Match Results</p>
											<p className="text-sm text-gray-400">
												Receive notifications about match outcomes
											</p>
										</div>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={matchResults}
												onChange={(e) => setMatchResults(e.target.checked)}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#5bc6ca] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5bc6ca]"></div>
										</label>
									</div>

									<div className="flex items-center justify-between py-3">
										<div>
											<p className="font-medium">System Updates</p>
											<p className="text-sm text-gray-400">
												Get notified about new features and updates
											</p>
										</div>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={systemUpdates}
												onChange={(e) => setSystemUpdates(e.target.checked)}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#5bc6ca] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5bc6ca]"></div>
										</label>
									</div>
								</div>
							</div>
						)}

						{/* Privacy Settings */}
						{activeTab === "privacy" && (
							<div className="space-y-6">
								<div>
									<h2 className="text-xl font-semibold mb-1">
										Privacy Settings
									</h2>
									<p className="text-sm text-gray-400">
										Control your privacy and data visibility
									</p>
								</div>

								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2">
											Profile Visibility
										</label>
										<select
											value={profileVisibility}
											onChange={(e) => setProfileVisibility(e.target.value)}
											className="w-full px-4 py-2 bg-[#252525] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#5bc6ca] focus:border-transparent"
										>
											<option value="public">Public - Anyone can view</option>
											<option value="friends">Friends only</option>
											<option value="private">Private - Only me</option>
										</select>
									</div>

									<div className="flex items-center justify-between py-3 border-b border-gray-700">
										<div>
											<p className="font-medium">Show Email</p>
											<p className="text-sm text-gray-400">
												Display your email on your profile
											</p>
										</div>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={showEmail}
												onChange={(e) => setShowEmail(e.target.checked)}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#5bc6ca] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5bc6ca]"></div>
										</label>
									</div>

									<div className="flex items-center justify-between py-3">
										<div>
											<p className="font-medium">Show Statistics</p>
											<p className="text-sm text-gray-400">
												Display your coding stats publicly
											</p>
										</div>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={showStats}
												onChange={(e) => setShowStats(e.target.checked)}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#5bc6ca] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5bc6ca]"></div>
										</label>
									</div>

									<div className="pt-4 border-t border-gray-700">
										<h3 className="text-lg font-medium mb-3 text-red-400">
											Danger Zone
										</h3>
										<button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
											Delete Account
										</button>
										<p className="text-xs text-gray-500 mt-2">
											This action cannot be undone. All your data will be
											permanently deleted.
										</p>
									</div>
								</div>
							</div>
						)}

						{/* Language Settings */}
						{activeTab === "language" && (
							<div className="space-y-6">
								<div>
									<h2 className="text-xl font-semibold mb-1">
										Language & Region
									</h2>
									<p className="text-sm text-gray-400">
										Set your language and regional preferences
									</p>
								</div>

								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2">
											Language
										</label>
										<select
											value={language}
											onChange={(e) => setLanguage(e.target.value)}
											className="w-full px-4 py-2 bg-[#252525] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#5bc6ca] focus:border-transparent"
										>
											<option value="en">English</option>
											<option value="es">Español</option>
											<option value="fr">Français</option>
											<option value="de">Deutsch</option>
											<option value="ja">日本語</option>
											<option value="zh">中文</option>
										</select>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-300 mb-2">
											Timezone
										</label>
										<select
											value={timezone}
											onChange={(e) => setTimezone(e.target.value)}
											className="w-full px-4 py-2 bg-[#252525] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#5bc6ca] focus:border-transparent"
										>
											<option value="UTC">UTC (GMT+0)</option>
											<option value="America/New_York">
												Eastern Time (GMT-5)
											</option>
											<option value="America/Chicago">
												Central Time (GMT-6)
											</option>
											<option value="America/Denver">
												Mountain Time (GMT-7)
											</option>
											<option value="America/Los_Angeles">
												Pacific Time (GMT-8)
											</option>
											<option value="Europe/London">London (GMT+0)</option>
											<option value="Europe/Paris">Paris (GMT+1)</option>
											<option value="Asia/Tokyo">Tokyo (GMT+9)</option>
											<option value="Asia/Shanghai">Shanghai (GMT+8)</option>
										</select>
									</div>
								</div>
							</div>
						)}

						{/* Save Button */}
						<div className="flex items-center justify-between pt-6 border-t border-gray-700 mt-6">
							{saveSuccess && (
								<div className="flex items-center space-x-2 text-green-500">
									<Check size={18} />
									<span className="text-sm">Settings saved successfully!</span>
								</div>
							)}
							<button
								onClick={handleSave}
								disabled={loading}
								className="ml-auto px-6 py-2 bg-[#5bc6ca] hover:bg-[#48aeb3] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? "Saving..." : "Save Changes"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SettingsPage;
