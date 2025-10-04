import { Link } from "react-router-dom";

type SectionHeaderProps = {
	title: string;
	actionText?: string;
	actionLink?: string;
	badge?: string;
};

const SectionHeader = ({
	title,
	actionText,
	actionLink,
	badge,
}: SectionHeaderProps) => {
	return (
		<div className="flex items-center justify-between mb-8">
			<h2 className="text-2xl font-bold">{title}</h2>

			<div className="flex items-center gap-4">
				{badge && (
					<div className="px-3 py-1 bg-[#232323] rounded-lg text-xs font-medium text-[#5bc6ca]">
						{badge}
					</div>
				)}

				{actionText && actionLink && (
					<Link
						to={actionLink}
						className="text-[#5bc6ca] text-sm hover:underline"
					>
						{actionText}
					</Link>
				)}
			</div>
		</div>
	);
};

export default SectionHeader;
