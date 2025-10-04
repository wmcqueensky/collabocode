import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

type ActivityItemProps = {
	title: string;
	mode: string;
	date: string;
	duration: string;
	actionText: string;
	actionLink: string;
};

const ActivityItem = ({
	title,
	mode,
	date,
	duration,
	actionText,
	actionLink,
}: ActivityItemProps) => {
	return (
		<div className="px-6 py-4 flex items-center justify-between hover:bg-[#232323] transition-colors">
			<div>
				<p className="font-medium">{title}</p>
				<div className="flex items-center text-sm text-gray-500 mt-1">
					<span className="text-[#5bc6ca] bg-[#5bc6ca]/10 px-2 py-0.5 rounded text-xs mr-3">
						{mode}
					</span>
					<span>{date}</span>
					<span className="mx-2">•</span>
					<span>{duration}</span>
				</div>
			</div>
			<Link
				to={actionLink}
				className="text-[#5bc6ca] hover:underline text-sm flex items-center"
			>
				<span>{actionText}</span>
				<ArrowRight size={14} className="ml-1" />
			</Link>
		</div>
	);
};

export default ActivityItem;
