import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

type ExploreCardProps = {
	title: string;
	description: string;
	headerGradient: string;
	headerContent: React.ReactNode;
	icon: React.ReactNode;
	features: Array<{
		icon: React.ReactNode;
		text: string;
	}>;
	footerText: string;
	buttonText: string;
	buttonHref?: string;
	buttonOnClick?: () => void;
	tagText: string;
	variant?: "teal" | "violet";
};

const ExploreCard = ({
	title,
	description,
	headerGradient,
	headerContent,
	icon,
	features,
	footerText,
	buttonText,
	buttonHref,
	buttonOnClick,
	tagText,
	variant = "teal",
}: ExploreCardProps) => {
	const [isHovered, setIsHovered] = useState(false);

	// Color schemes that harmonize together
	const colors = {
		teal: {
			border: "border-[#5bc6ca]",
			title: "text-[#5bc6ca]",
			button: "bg-[#5bc6ca] hover:bg-[#48aeb3]",
			shadow: "rgba(91, 198, 202, 0.25)",
		},
		violet: {
			border: "border-[#8b5cf6]",
			title: "text-[#a78bfa]",
			button: "bg-[#8b5cf6] hover:bg-[#7c3aed]",
			shadow: "rgba(139, 92, 246, 0.25)",
		},
	};

	const currentColors = colors[variant];

	return (
		<div
			className={`bg-[#1f1f1f] rounded-xl overflow-hidden border-2 transition-all duration-300 ${
				isHovered
					? `${currentColors.border} transform scale-[1.02]`
					: "border-gray-700"
			}`}
			style={{
				boxShadow: isHovered
					? `0 10px 40px -10px ${currentColors.shadow}`
					: "none",
			}}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className={`h-40 ${headerGradient} relative overflow-hidden`}>
				<div className="absolute inset-0 opacity-20">{headerContent}</div>
				<div className="absolute bottom-4 left-4 bg-black/50 rounded-lg px-3 py-1 text-sm font-medium backdrop-blur-sm">
					{tagText}
				</div>
			</div>
			<div className="p-6">
				<div className="flex items-start justify-between mb-4">
					<h2 className={`text-2xl font-bold ${currentColors.title}`}>
						{title}
					</h2>
					<div className="bg-[#232323] p-2 rounded-lg">{icon}</div>
				</div>
				<p className="text-gray-400 mb-6">{description}</p>
				<div className="grid grid-cols-2 gap-4 mb-6">
					{features.map((feature, index) => (
						<div
							key={index}
							className="flex items-center space-x-2 text-sm text-gray-400"
						>
							{feature.icon}
							<span>{feature.text}</span>
						</div>
					))}
				</div>
				<div className="flex justify-between items-center">
					<span className="text-sm text-gray-500">{footerText}</span>
					{buttonOnClick ? (
						<button
							onClick={buttonOnClick}
							className={`flex items-center ${currentColors.button} ${
								variant === "violet" ? "text-white" : "text-black"
							} font-medium px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105`}
						>
							<span>{buttonText}</span>
							<ArrowRight size={16} className="ml-2" />
						</button>
					) : (
						<Link
							to={buttonHref || "#"}
							className={`flex items-center ${currentColors.button} ${
								variant === "violet" ? "text-white" : "text-black"
							} font-medium px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105`}
						>
							<span>{buttonText}</span>
							<ArrowRight size={16} className="ml-2" />
						</Link>
					)}
				</div>
			</div>
		</div>
	);
};

export default ExploreCard;
