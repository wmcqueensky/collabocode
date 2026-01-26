import { Check, Clock, Cpu, PlayCircle, X, Trophy } from "lucide-react";

export const RecentActivities = ({
	activities = [],
	isMobile = false,
}: any) => {
	const activityIcons: any = {
		passed: Check,
		modifying: Cpu,
		ran: PlayCircle,
		failed: X,
		submitted: Trophy,
	};

	const activityColors: any = {
		passed: "text-green-600",
		modifying: "text-sky-600",
		ran: "text-yellow-600",
		failed: "text-red-500",
		submitted: "text-purple-600",
	};

	return (
		<div className="flex flex-col bg-white border-r border-gray-200 rounded-lg">
			{/* Header */}
			<div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200">
				<h3
					className={`${
						isMobile ? "text-xs" : "text-sm"
					} font-medium text-gray-900 flex items-center`}
				>
					<Clock size={isMobile ? 14 : 16} className="mr-2 text-sky-600" />
					Activity Feed
				</h3>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-auto p-2 sm:p-4">
				{activities.length === 0 ? (
					<div className="text-center text-gray-500 text-xs sm:text-sm py-4">
						No activities yet
					</div>
				) : (
					<div
						className={`space-y-2 sm:space-y-3 ${
							isMobile ? "text-xs" : "text-sm"
						}`}
					>
						{activities.map((activity: any, index: number) => {
							const IconComponent = activityIcons[activity.type];
							const colorClass = activityColors[activity.type];

							return (
								<div
									key={`${activity.id}-${index}`}
									className={`flex items-center ${colorClass} animate-fade-in transition-all duration-500`}
									style={{
										animationDelay: `${index * 100}ms`,
									}}
								>
									<IconComponent
										size={isMobile ? 12 : 14}
										className="mr-2 flex-shrink-0"
									/>
									<span className="flex-1 truncate text-gray-700 min-w-0">
										{activity.message}
									</span>
									<span
										className={`ml-2 text-gray-500 ${
											isMobile ? "text-xs" : "text-xs"
										} flex-shrink-0`}
									>
										{activity.timestamp}
									</span>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};
