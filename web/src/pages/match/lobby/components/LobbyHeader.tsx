import { Users } from "lucide-react";

interface LobbyHeaderProps {
	isCollaboration: boolean;
}

export const LobbyHeader = ({ isCollaboration }: LobbyHeaderProps) => {
	const gradientFrom = isCollaboration ? "from-purple-500" : "from-[#5bc6ca]";
	const gradientTo = isCollaboration ? "to-purple-600" : "to-[#48aeb3]";

	return (
		<div
			className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} p-6 text-center`}
		>
			<div className="flex items-center justify-center mb-2">
				<Users size={32} className="text-white mr-2" />
				<h1 className="text-3xl font-bold text-white">
					{isCollaboration
						? "Waiting for Collaborators"
						: "Waiting for Players"}
				</h1>
			</div>
			<p className="text-white/90 text-sm">
				{isCollaboration
					? "Please wait while collaborators accept the invitation"
					: "Please wait while other players accept the invitation"}
			</p>
		</div>
	);
};
