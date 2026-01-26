import { Trophy } from "lucide-react";
import { Avatar } from "./Avatar";

export const RaceTrack = ({ participants, isMobile = false }: any) => {
	return (
		<div className="flex flex-col bg-white border-r border-gray-200 rounded-lg">
			{/* Header */}
			<div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200">
				<h3
					className={`text-gray-900 ${
						isMobile ? "text-xs" : "text-sm"
					} font-medium flex items-center`}
				>
					<Trophy size={isMobile ? 14 : 16} className="mr-2 text-sky-600" />
					Race Progress
				</h3>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-auto p-2 sm:p-4">
				<div className={`space-y-${isMobile ? "2" : "4"}`}>
					{participants.map((participant: any) => {
						const isComplete = participant.isCorrect;
						const position = participant.finishPosition;

						return (
							<div
								key={participant.id}
								className={`flex items-center space-x-2 sm:space-x-3 transition-all duration-500`}
							>
								<div className={`${isMobile ? "w-8" : "w-10"} flex-shrink-0`}>
									<Avatar
										user={participant}
										size={isMobile ? "sm" : "md"}
										status={isComplete ? "complete" : participant.status}
										position={position}
									/>
								</div>

								<div className="flex-1 min-w-0">
									<div
										className={`flex justify-between ${
											isMobile ? "text-xs" : "text-sm"
										} mb-1 sm:mb-2`}
									>
										<span
											className={`font-medium truncate ${
												isComplete ? "text-green-600" : "text-gray-900"
											}`}
										>
											{participant.name}
										</span>
										<span
											className={`${isMobile ? "text-xs" : "text-xs"} ${
												isComplete ? "text-green-600" : "text-gray-500"
											} ml-2 flex-shrink-0`}
										>
											{Math.round(participant.progress)}%
										</span>
									</div>

									<div
										className={`w-full bg-gray-200 rounded-full ${
											isMobile ? "h-2" : "h-2.5"
										} overflow-hidden`}
									>
										<div
											className={`h-full rounded-full transition-all duration-1000 ease-out ${
												isComplete
													? "bg-gradient-to-r from-green-500 to-green-400 animate-pulse"
													: "bg-gradient-to-r from-sky-500 to-sky-400"
											}`}
											style={{ width: `${participant.progress}%` }}
										/>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};
