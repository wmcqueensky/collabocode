import { Users } from "lucide-react";

interface EmptySlotProps {
	isCollaboration: boolean;
}

export const EmptySlot = ({ isCollaboration }: EmptySlotProps) => {
	return (
		<div className="flex items-center justify-between p-4 rounded-lg border border-dashed border-gray-700 bg-[#2a2a2a]/50">
			<div className="flex items-center space-x-3">
				<div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
					<Users size={24} className="text-gray-500" />
				</div>
				<div>
					<p className="text-gray-500 font-medium">
						Waiting for {isCollaboration ? "collaborator" : "player"}...
					</p>
					<p className="text-sm text-gray-600">Slot available</p>
				</div>
			</div>
			<span className="text-gray-600">Empty</span>
		</div>
	);
};
