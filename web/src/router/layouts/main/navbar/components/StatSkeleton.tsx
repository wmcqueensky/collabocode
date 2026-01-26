import { Loader2 } from "lucide-react";

// Animated loading spinner component for stats
export const StatSkeleton = () => (
	<div className="flex items-center space-x-1 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 animate-pulse">
		<Loader2 size={16} className="text-gray-400 animate-spin" />
		<div className="h-4 w-8 bg-gray-200 rounded"></div>
	</div>
);
