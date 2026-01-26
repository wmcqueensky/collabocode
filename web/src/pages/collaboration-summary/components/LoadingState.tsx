import { Loader2 } from "lucide-react";

export default function LoadingState() {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center">
			<div className="text-center">
				<Loader2
					className="text-purple-500 mx-auto mb-4 animate-spin"
					size={48}
				/>
				<div className="text-gray-900 text-xl">
					Loading collaboration summary...
				</div>
			</div>
		</div>
	);
}
