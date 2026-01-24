import { Loader2 } from "lucide-react";

// Animated loading spinner component for stats
export const StatSkeleton = () => (
	<div className="flex items-center space-x-1 bg-[#252525] px-3 py-1.5 rounded-lg border border-gray-700 animate-pulse">
		<Loader2 size={16} className="text-gray-500 animate-spin" />
		<div className="h-4 w-8 bg-gray-700 rounded"></div>
	</div>
);
