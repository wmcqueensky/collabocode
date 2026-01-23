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
		<div className="flex border-b border-gray-800">
			{tabs.map((tab) => (
				<button
					key={tab.id}
					onClick={() => onTabChange(tab.id)}
					className={`flex-1 px-6 py-3 font-medium transition-colors ${
						activeTab === tab.id
							? "bg-[#5bc6ca] bg-opacity-10 text-[#5bc6ca] border-b-2 border-[#5bc6ca]"
							: "text-gray-400 hover:text-white hover:bg-gray-800"
					}`}
				>
					{tab.label}
				</button>
			))}
		</div>
	);
};

export default ProfileTabs;
