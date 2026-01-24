import { X, Flame } from "lucide-react";
import { getStreakEmoji } from "../constants";
import type { StreakHeaderProps } from "../types";

export const StreakHeader = ({ streak, onClose }: StreakHeaderProps) => {
	return (
		<div className="relative bg-gradient-to-r from-orange-600 via-red-500 to-orange-500 px-6 py-8 overflow-hidden">
			{/* Animated background elements */}
			<div className="absolute inset-0 opacity-20">
				<div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
				<div className="absolute bottom-0 right-0 w-24 h-24 bg-yellow-300 rounded-full blur-2xl animate-pulse delay-300" />
			</div>

			<button
				onClick={onClose}
				className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
			>
				<X size={20} />
			</button>

			<div className="relative text-center">
				<div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm animate-bounce-slow">
					<Flame size={40} className="text-white drop-shadow-lg" />
				</div>
				<h2 className="text-3xl font-bold text-white mb-1">
					{streak} Day Streak! {getStreakEmoji(streak)}
				</h2>
				<p className="text-white/80 text-sm">Welcome back, coder!</p>
			</div>
		</div>
	);
};
