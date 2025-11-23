import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

const Footer = ({ isChatOpen, setIsChatOpen }: any) => {
	return (
		<footer className="flex items-center justify-between px-2 sm:px-4 py-1 sm:py-2 bg-[#2c2c2c] border-t border-gray-700 text-xs text-gray-400">
			<div className="flex items-center space-x-2 sm:space-x-4">
				<div className="text-xs">JavaScript</div>
				<div className="text-xs">UTF-8</div>
			</div>

			<div className="flex items-center space-x-2">
				{/* Desktop chat toggle */}
				<button
					className="hidden md:flex min-w-[80px] sm:min-w-[100px] px-2 py-1 items-center hover:text-gray-200"
					onClick={() => setIsChatOpen(!isChatOpen)}
				>
					{isChatOpen ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
					<span className="ml-1 text-xs">
						{isChatOpen ? "Hide Chat" : "Show Chat"}
					</span>
				</button>
				<a
					href="#"
					className="flex items-center hover:text-gray-200"
					target="_blank"
					rel="noopener noreferrer"
				>
					<span className="mr-1">Docs</span>
					<ExternalLink size={12} />
				</a>
			</div>
		</footer>
	);
};

export default Footer;
