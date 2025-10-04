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
}: ExploreCardProps) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div
			className={`bg-[#1f1f1f] rounded-xl overflow-hidden border-2 transition-all duration-300 ${
				isHovered
					? "border-[#5bc6ca] transform scale-[1.02]"
					: "border-gray-700"
			}`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className={`h-40 ${headerGradient} relative overflow-hidden`}>
				<div className="absolute inset-0 opacity-20">{headerContent}</div>
				<div className="absolute bottom-4 left-4 bg-black/50 rounded-lg px-3 py-1 text-sm font-medium">
					{tagText}
				</div>
			</div>

			<div className="p-6">
				<div className="flex items-start justify-between mb-4">
					<h2 className="text-2xl font-bold text-[#5bc6ca]">{title}</h2>
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
							className="flex items-center bg-[#5bc6ca] hover:bg-[#48aeb3] text-black font-medium px-4 py-2 rounded-lg transition"
						>
							<span>{buttonText}</span>
							<ArrowRight size={16} className="ml-2" />
						</button>
					) : (
						<Link
							to={buttonHref || "#"}
							className="flex items-center bg-[#5bc6ca] hover:bg-[#48aeb3] text-black font-medium px-4 py-2 rounded-lg transition"
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
