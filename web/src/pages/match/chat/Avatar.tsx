export const Avatar = ({ user, size = "md", status, position }: any) => {
	const sizeClasses: any = {
		sm: "w-6 h-6 text-xs",
		md: "w-7 h-7 text-xs sm:w-8 sm:h-8 sm:text-sm",
		lg: "w-8 h-8 text-sm sm:w-10 sm:h-10 sm:text-base",
	};

	const getBackgroundColor = (name: string) => {
		const colors = {
			Sarah: "bg-rose-500",
			Alex: "bg-amber-500",
			You: "bg-emerald-500",
			Miguel: "bg-purple-500",
		};
		return colors[name as keyof typeof colors] || "bg-gray-500";
	};

	const getTextColor = (name: string) => {
		const lightBg = ["Alex", "You"];
		return lightBg.includes(name) ? "text-gray-900" : "text-white";
	};

	return (
		<div className="relative">
			<div
				className={`${
					sizeClasses[size]
				} rounded-full flex items-center justify-center font-medium border-2 border-white ${getBackgroundColor(
					user.name,
				)} ${getTextColor(user.name)}`}
			>
				{user.name.charAt(0)}
			</div>
			{status === "complete" && position && (
				<div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
					{position}
				</div>
			)}
		</div>
	);
};
