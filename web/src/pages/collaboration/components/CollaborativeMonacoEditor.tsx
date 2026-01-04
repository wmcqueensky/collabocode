import { useEffect, useRef, useState, useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor as MonacoEditorType } from "monaco-editor";
import {
	CollaborationDocument,
	type UserAwareness,
} from "../../../services/yjs/collaborationDocument";
import { MonacoYjsBinding } from "../../../services/yjs/monacoYjsBinding";

interface CollaborativeFile {
	id: string;
	filename: string;
	language: string;
	content: string;
}

interface RemoteCursor {
	id: string;
	name: string;
	color: string;
	lineNumber: number;
	column: number;
}

interface CollaborativeMonacoEditorProps {
	file: CollaborativeFile;
	collaborationDoc: CollaborationDocument | null;
	userId: string;
	onContentChange?: (content: string) => void;
	isMobile?: boolean;
}

export const CollaborativeMonacoEditor = ({
	file,
	collaborationDoc,
	userId,
	onContentChange,
	isMobile = false,
}: CollaborativeMonacoEditorProps) => {
	const editorRef = useRef<MonacoEditorType.IStandaloneCodeEditor | null>(null);
	const bindingRef = useRef<MonacoYjsBinding | null>(null);
	const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
	const [isConnected, setIsConnected] = useState(false);

	// Handle editor mount
	const handleEditorDidMount: OnMount = useCallback(
		(editor) => {
			editorRef.current = editor;

			// Set up Yjs binding if collaboration doc is ready
			if (collaborationDoc && collaborationDoc.awareness) {
				setupBinding(editor);
			}
		},
		[collaborationDoc, userId, file.content]
	);

	// Set up Yjs binding
	const setupBinding = useCallback(
		(editor: MonacoEditorType.IStandaloneCodeEditor) => {
			if (!collaborationDoc || !collaborationDoc.awareness) return;

			// Clean up previous binding
			if (bindingRef.current) {
				bindingRef.current.dispose();
				bindingRef.current = null;
			}

			const ytext = collaborationDoc.getText();
			const binding = new MonacoYjsBinding(
				editor,
				ytext,
				collaborationDoc.awareness,
				userId
			);

			// Set initial content if Yjs doc is empty
			if (ytext.toString() === "" && file.content) {
				binding.setContent(file.content);
			}

			bindingRef.current = binding;
			setIsConnected(true);

			// Track remote cursors for UI display
			collaborationDoc.awareness.on("change", () => {
				const cursors: RemoteCursor[] = [];
				collaborationDoc.awareness?.getStates().forEach((state, clientId) => {
					const userState = state as UserAwareness;
					if (
						userState.user?.id !== userId &&
						userState.cursor &&
						userState.user
					) {
						cursors.push({
							id: userState.user.id,
							name: userState.user.name,
							color: userState.user.color,
							lineNumber: userState.cursor.lineNumber,
							column: userState.cursor.column,
						});
					}
				});
				setRemoteCursors(cursors);
			});
		},
		[collaborationDoc, userId, file.content]
	);

	// Set up binding when collaboration doc becomes available
	useEffect(() => {
		if (editorRef.current && collaborationDoc && collaborationDoc.awareness) {
			setupBinding(editorRef.current);
		}

		return () => {
			if (bindingRef.current) {
				bindingRef.current.dispose();
				bindingRef.current = null;
			}
		};
	}, [collaborationDoc, setupBinding]);

	// Handle manual content changes (for non-collaborative fallback)
	const handleEditorChange = useCallback(
		(value: string | undefined) => {
			if (value !== undefined && onContentChange && !bindingRef.current) {
				onContentChange(value);
			}
		},
		[onContentChange]
	);

	// Get Monaco language from file extension
	const getMonacoLanguage = (filename: string): string => {
		const ext = filename.split(".").pop()?.toLowerCase();
		const languageMap: Record<string, string> = {
			js: "javascript",
			jsx: "javascript",
			ts: "typescript",
			tsx: "typescript",
			py: "python",
			java: "java",
			cpp: "cpp",
			c: "c",
			cs: "csharp",
			go: "go",
			rb: "ruby",
			php: "php",
			swift: "swift",
			kt: "kotlin",
			rs: "rust",
			css: "css",
			html: "html",
			json: "json",
			md: "markdown",
			sql: "sql",
			xml: "xml",
			yaml: "yaml",
			yml: "yaml",
		};
		return languageMap[ext || ""] || file.language || "javascript";
	};

	return (
		<div className="flex-1 overflow-hidden relative">
			{/* Connection Status */}
			<div className="absolute top-2 right-2 z-10 flex items-center space-x-2">
				{/* Remote Cursors Indicator */}
				{remoteCursors.length > 0 && (
					<div className="flex items-center space-x-1 bg-gray-800/90 rounded-full px-2 py-1">
						<div className="flex -space-x-1">
							{remoteCursors.slice(0, 3).map((cursor) => (
								<div
									key={cursor.id}
									className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium border border-gray-700"
									style={{ backgroundColor: cursor.color }}
									title={`${cursor.name} - Line ${cursor.lineNumber}`}
								>
									{cursor.name.charAt(0).toUpperCase()}
								</div>
							))}
						</div>
						{remoteCursors.length > 3 && (
							<span className="text-xs text-gray-400">
								+{remoteCursors.length - 3}
							</span>
						)}
					</div>
				)}

				{/* Connection Status Dot */}
				<div
					className={`w-2 h-2 rounded-full ${
						isConnected ? "bg-green-500" : "bg-yellow-500 animate-pulse"
					}`}
					title={isConnected ? "Connected" : "Connecting..."}
				/>
			</div>

			{/* Monaco Editor */}
			<Editor
				height="100%"
				language={getMonacoLanguage(file.filename)}
				value={bindingRef.current ? undefined : file.content}
				theme="vs-dark"
				onMount={handleEditorDidMount}
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
					// Collaborative editing settings
					acceptSuggestionOnCommitCharacter: false,
					quickSuggestions: true,
					suggestOnTriggerCharacters: true,
				}}
			/>
		</div>
	);
};

export default CollaborativeMonacoEditor;
