import { Bell } from "lucide-react";

export const EmptyState = () => {
	return (
		<div className="p-8 text-center text-gray-500">
			<Bell size={48} className="mx-auto mb-3 opacity-30" />
			<p>No new notifications</p>
		</div>
	);
};
