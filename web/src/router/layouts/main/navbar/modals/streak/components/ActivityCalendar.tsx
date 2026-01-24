import { Calendar, Flame } from "lucide-react";
import { WEEK_DAYS } from "../constants";
import type { ActivityCalendarProps } from "../types";

export const ActivityCalendar = ({ calendarDays }: ActivityCalendarProps) => {
	return (
		<div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-700">
			<div className="flex items-center gap-2 mb-3">
				<Calendar size={16} className="text-gray-400" />
				<span className="text-sm text-gray-400">Last 4 weeks</span>
			</div>

			{/* Week day headers */}
			<div className="grid grid-cols-7 gap-1 mb-2">
				{WEEK_DAYS.map((day, index) => (
					<div key={index} className="text-center">
						<span className="text-xs text-gray-600">{day}</span>
					</div>
				))}
			</div>

			{/* Calendar grid */}
			<div className="grid grid-cols-7 gap-1">
				{calendarDays.map((day, index) => (
					<div
						key={index}
						className={`aspect-square rounded-sm flex items-center justify-center transition-all ${
							day.isToday
								? "ring-2 ring-orange-500 ring-offset-1 ring-offset-[#1a1a1a]"
								: ""
						} ${
							day.isActive
								? day.isToday
									? "bg-gradient-to-br from-orange-500 to-red-500"
									: "bg-gradient-to-br from-orange-500/60 to-red-500/60"
								: "bg-gray-800"
						}`}
						title={day.date.toLocaleDateString()}
					>
						{day.isActive && (
							<Flame
								size={10}
								className={day.isToday ? "text-white" : "text-orange-200"}
							/>
						)}
					</div>
				))}
			</div>

			{/* Legend */}
			<div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
				<div className="flex items-center gap-1">
					<div className="w-3 h-3 rounded-sm bg-gray-800" />
					<span>Inactive</span>
				</div>
				<div className="flex items-center gap-1">
					<div className="w-3 h-3 rounded-sm bg-gradient-to-br from-orange-500/60 to-red-500/60" />
					<span>Active</span>
				</div>
				<div className="flex items-center gap-1">
					<div className="w-3 h-3 rounded-sm bg-gradient-to-br from-orange-500 to-red-500 ring-1 ring-orange-500" />
					<span>Today</span>
				</div>
			</div>
		</div>
	);
};
