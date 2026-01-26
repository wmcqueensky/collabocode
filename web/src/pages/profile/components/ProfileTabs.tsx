import type { ProfileTab } from "../types";

interface ProfileTabsProps {
	activeTab: ProfileTab;
	onTabChange: (tab: ProfileTab) => void;
}

const ProfileTabs = ({ activeTab, onTabChange }: ProfileTabsProps) => {
	const tabs: { id: ProfileTab; label: string }[] = [
		{ id: "overview", label: "Overview" },
		{ id: "matches", label: "Match History" },
		{ id: "collaborations", label: "Collaboration History" },
	];

	return (
		<div className="flex border-b border-gray-200">
			{tabs.map((tab) => (
				<button
					key={tab.id}
					onClick={() => onTabChange(tab.id)}
					className={`flex-1 px-6 py-3 font-medium transition-colors ${
						activeTab === tab.id
							? "bg-sky-50 text-sky-600 border-b-2 border-sky-600"
							: "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
					}`}
				>
					{tab.label}
				</button>
			))}
		</div>
	);
};

export default ProfileTabs;
