type ComingSoonCardProps = {
	title: string;
	description: string;
	icon: React.ReactNode;
	releaseDate: string;
	features: string[];
};

const ComingSoonCard = ({
	title,
	description,
	icon,
	releaseDate,
	features,
}: ComingSoonCardProps) => {
	return (
		<div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-700 relative overflow-hidden group">
			<div className="absolute inset-0 bg-gradient-to-br from-[#5bc6ca]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
			<div className="absolute top-4 right-4">
				<div className="bg-[#5bc6ca]/20 text-[#5bc6ca] text-xs font-medium px-2 py-1 rounded">
					{releaseDate}
				</div>
			</div>

			<div className="mb-4">
				<div className="w-10 h-10 rounded-lg bg-[#232323] flex items-center justify-center mb-3">
					{icon}
				</div>
				<h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
				<p className="text-gray-400 text-sm">{description}</p>
			</div>

			<div className="border-t border-gray-700 pt-4 mt-4">
				<span className="text-xs text-gray-500">Features will include:</span>
				<div className="flex flex-wrap gap-2 mt-2">
					{features.map((feature, index) => (
						<div
							key={index}
							className="bg-[#232323] text-xs text-gray-400 px-2 py-1 rounded"
						>
							{feature}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default ComingSoonCard;
