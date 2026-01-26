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
	const gradientFrom = isCollaboration ? "from-purple-500" : "from-sky-500";
	const gradientTo = isCollaboration ? "to-purple-600" : "to-sky-600";

	return (
		<div>
			<div className="flex justify-between items-center mb-2">
				<span className="text-sm text-gray-600">
					{isCollaboration ? "Collaborator Status" : "Player Status"}
				</span>
				<span className="text-sm text-gray-600">
					{joinedCount} / {maxPlayers} ready
				</span>
			</div>
			<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
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
