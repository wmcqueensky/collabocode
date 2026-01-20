import { Loader2 } from "lucide-react";

export default function LoadingState() {
	return (
		<div className="min-h-screen bg-[#171717] flex items-center justify-center">
			<div className="text-center">
				<Loader2
					className="text-[#5bc6ca] mx-auto mb-4 animate-spin"
					size={48}
				/>
				<div className="text-white text-xl">Loading match summary...</div>
			</div>
		</div>
	);
}
