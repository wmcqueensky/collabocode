interface ParticipantProgressBarProps {
	joinedCount: number;
	maxPlayers: number;
	isCollaboration: boolean;
}

export const ParticipantProgressBar = ({
	joinedCount,
	maxPlayers,
	isCollaboration,
}: ParticipantProgressBarProps) => {
	const gradientFrom = isCollaboration ? "from-purple-500" : "from-[#5bc6ca]";
	const gradientTo = isCollaboration ? "to-purple-600" : "to-[#48aeb3]";

	return (
		<div>
			<div className="flex justify-between items-center mb-2">
				<span className="text-sm text-gray-400">
					{isCollaboration ? "Collaborator Status" : "Player Status"}
				</span>
				<span className="text-sm text-gray-400">
					{joinedCount} / {maxPlayers} ready
				</span>
			</div>
			<div className="h-2 bg-gray-700 rounded-full overflow-hidden">
				<div
					className={`h-full bg-gradient-to-r ${gradientFrom} ${gradientTo} transition-all duration-500`}
					style={{
						width: `${(joinedCount / maxPlayers) * 100}%`,
					}}
				></div>
			</div>
		</div>
	);
};
