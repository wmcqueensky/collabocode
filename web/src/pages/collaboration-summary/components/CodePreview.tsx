import { Code } from "lucide-react";
import Editor from "@monaco-editor/react";
import type { TeamEvaluation } from "../utils/types";
import { getMonacoLanguage } from "../utils/utils";

interface CodePreviewProps {
	sharedCode: string;
	language: string;
	teamEvaluation: TeamEvaluation;
}

export default function CodePreview({
	sharedCode,
	language,
	teamEvaluation,
}: CodePreviewProps) {
	if (!sharedCode) {
		return null;
	}

	return (
		<div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
			<h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
				<Code className="mr-2 text-purple-500" size={20} />
				Your Team's Solution
			</h3>
			<div className="rounded-lg overflow-hidden border border-gray-200">
				<Editor
					height="400px"
					language={getMonacoLanguage(language)}
					value={sharedCode}
					theme="vs"
					options={{
						readOnly: true,
						fontSize: 14,
						fontFamily: "Fira Code, Monaco, Menlo, Consolas, monospace",
						minimap: { enabled: false },
						lineNumbers: "on",
						scrollBeyondLastLine: false,
						wordWrap: "on",
						folding: true,
						renderWhitespace: "none",
						padding: { top: 16, bottom: 16 },
						scrollbar: {
							vertical: "auto",
							horizontal: "auto",
							verticalScrollbarSize: 10,
							horizontalScrollbarSize: 10,
						},
						overviewRulerLanes: 0,
						hideCursorInOverviewRuler: true,
						overviewRulerBorder: false,
						contextmenu: false,
						selectOnLineNumbers: false,
						cursorStyle: "line",
						cursorBlinking: "solid",
					}}
				/>
			</div>
			<div className="mt-3 flex items-center justify-between text-xs text-gray-500">
				<span className="flex items-center">
					<Code size={12} className="mr-1" />
					{language?.charAt(0).toUpperCase() + language?.slice(1)} •{" "}
					{sharedCode.split("\n").length} lines
				</span>
				<span>
					{teamEvaluation.complexity.timeComplexity} time •{" "}
					{teamEvaluation.complexity.spaceComplexity} space
				</span>
			</div>
		</div>
	);
}
