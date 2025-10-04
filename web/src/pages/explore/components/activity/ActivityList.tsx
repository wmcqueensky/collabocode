import { Link } from "react-router-dom";
import ActivityItem from "./ActivityItem";

type ActivityListProps = {
	title: string;
	timeframe: string;
	activities: Array<{
		title: string;
		mode: string;
		date: string;
		duration: string;
		actionText: string;
		actionLink: string;
	}>;
	footerText: string;
	footerLink: string;
};

const ActivityList = ({
	title,
	timeframe,
	activities,
	footerText,
	footerLink,
}: ActivityListProps) => {
	return (
		<div className="bg-[#1f1f1f] rounded-xl overflow-hidden">
			<div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
				<div className="flex items-center">
					<div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
					<h3 className="font-medium">{title}</h3>
				</div>
				<span className="text-xs text-gray-500">{timeframe}</span>
			</div>

			<div className="divide-y divide-gray-700">
				{activities.map((activity, index) => (
					<ActivityItem
						key={index}
						title={activity.title}
						mode={activity.mode}
						date={activity.date}
						duration={activity.duration}
						actionText={activity.actionText}
						actionLink={activity.actionLink}
					/>
				))}
			</div>

			<div className="px-6 py-4 bg-[#232323] text-center">
				<Link
					to={footerLink}
					className="text-[#5bc6ca] hover:underline text-sm"
				>
					{footerText}
				</Link>
			</div>
		</div>
	);
};

export default ActivityList;
