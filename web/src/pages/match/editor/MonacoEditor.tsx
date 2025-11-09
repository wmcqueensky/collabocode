import Editor from "@monaco-editor/react";

export const MonacoEditor = ({
	file,
	updateFileContent,
	isMobile = false,
}: any) => {
	const handleEditorChange = (value: string | undefined) => {
		if (value !== undefined) {
			updateFileContent(file.name, value);
		}
	};

	return (
		<div className="flex-1 overflow-hidden">
			<Editor
				height="100%"
				defaultLanguage={file.language}
				value={file.content}
				theme="vs-dark"
				onChange={handleEditorChange}
				options={{
					fontSize: isMobile ? 12 : 14,
					fontFamily: "Fira Code, Monaco, Menlo, Consolas, monospace",
					minimap: { enabled: !isMobile },
					lineNumbers: "on",
					automaticLayout: true,
					wordWrap: isMobile ? "on" : "off",
					scrollBeyondLastLine: false,
					renderWhitespace: "none",
					folding: !isMobile,
					lineDecorationsWidth: isMobile ? 5 : 10,
					lineNumbersMinChars: isMobile ? 3 : 4,
					glyphMargin: !isMobile,
					scrollbar: {
						vertical: isMobile ? "hidden" : "auto",
						horizontal: isMobile ? "hidden" : "auto",
						verticalScrollbarSize: isMobile ? 8 : 12,
						horizontalScrollbarSize: isMobile ? 8 : 12,
					},
					overviewRulerLanes: isMobile ? 0 : 3,
					hideCursorInOverviewRuler: isMobile,
					overviewRulerBorder: !isMobile,
					padding: {
						top: isMobile ? 8 : 12,
						bottom: isMobile ? 8 : 12,
					},
				}}
			/>
		</div>
	);
};
