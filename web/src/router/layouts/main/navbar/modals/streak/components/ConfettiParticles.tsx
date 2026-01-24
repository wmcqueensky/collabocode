import { Sparkles } from "lucide-react";
import { getRandomConfettiColor } from "../constants";
import type { ConfettiParticlesProps } from "../types";

export const ConfettiParticles = ({ show, streak }: ConfettiParticlesProps) => {
	if (!show || streak <= 1) return null;

	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			{[...Array(15)].map((_, i) => (
				<div
					key={i}
					className="absolute animate-confetti"
					style={{
						left: `${Math.random() * 100}%`,
						animationDelay: `${Math.random() * 0.5}s`,
						animationDuration: `${2 + Math.random() * 2}s`,
					}}
				>
					<Sparkles size={16} className={getRandomConfettiColor()} />
				</div>
			))}
		</div>
	);
};
