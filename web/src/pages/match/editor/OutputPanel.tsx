export const OutputPanel = ({ output, isMobile = false }: any) => {
	return (
		<div
			className={`${
				isMobile ? "h-24" : "h-32"
			} border-t border-gray-200 overflow-hidden flex flex-col`}
		>
			<div className="flex items-center px-2 sm:px-3 py-1 border-b border-gray-200 bg-gray-50">
				<div
					className={`${
						isMobile ? "text-xs" : "text-sm"
					} font-medium text-gray-700`}
				>
					Console Output
				</div>
			</div>
			<div
				className={`flex-1 p-2 font-mono ${
					isMobile ? "text-xs" : "text-xs sm:text-sm"
				} overflow-auto bg-white text-gray-700`}
			>
				{output.map((line: any, i: any) => (
					<div
						key={i}
						className={`${
							line.status === "pass"
								? "text-sky-600"
								: line.status === "fail"
									? "text-red-500"
									: ""
						} break-words`}
					>
						{line.message}
					</div>
				))}
			</div>
		</div>
	);
};
