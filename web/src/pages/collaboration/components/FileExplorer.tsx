import { useState, type JSX } from "react";
import {
	ChevronRight,
	ChevronDown,
	File,
	Folder,
	FolderOpen,
	Plus,
	Trash2,
	Edit2,
	Check,
	X,
} from "lucide-react";
import type { CollaborationFile } from "../../../services/collaborationService";

interface FileExplorerProps {
	files: CollaborationFile[];
	activeFile: string | null;
	setActiveFile: (filename: string) => void;
	onCreateFile?: (filename: string) => void;
	onRenameFile?: (fileId: string, newName: string) => void;
	onDeleteFile?: (fileId: string) => void;
	isMobile?: boolean;
}

interface FileNode {
	name: string;
	type: "file" | "folder";
	path: string;
	file?: CollaborationFile;
	children?: FileNode[];
}

export const FileExplorer = ({
	files,
	activeFile,
	setActiveFile,
	onCreateFile,
	onRenameFile,
	onDeleteFile,
	isMobile = false,
}: FileExplorerProps) => {
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
		new Set(["src", "components"])
	);
	const [renamingFile, setRenamingFile] = useState<string | null>(null);
	const [renameValue, setRenameValue] = useState("");
	const [showNewFileInput, setShowNewFileInput] = useState(false);
	const [newFileName, setNewFileName] = useState("");

	// Build file tree from flat file list
	const buildFileTree = (files: CollaborationFile[]): FileNode[] => {
		const root: FileNode[] = [];
		const folderMap = new Map<string, FileNode>();

		files.forEach((file) => {
			const parts = file.filename.split("/");
			let currentPath = "";

			parts.forEach((part, index) => {
				const isFile = index === parts.length - 1;
				const parentPath = currentPath;
				currentPath = currentPath ? `${currentPath}/${part}` : part;

				if (isFile) {
					const fileNode: FileNode = {
						name: part,
						type: "file",
						path: currentPath,
						file,
					};

					if (parentPath && folderMap.has(parentPath)) {
						folderMap.get(parentPath)!.children!.push(fileNode);
					} else {
						root.push(fileNode);
					}
				} else {
					if (!folderMap.has(currentPath)) {
						const folderNode: FileNode = {
							name: part,
							type: "folder",
							path: currentPath,
							children: [],
						};
						folderMap.set(currentPath, folderNode);

						if (parentPath && folderMap.has(parentPath)) {
							folderMap.get(parentPath)!.children!.push(folderNode);
						} else {
							root.push(folderNode);
						}
					}
				}
			});
		});

		// Sort: folders first, then files, alphabetically
		const sortNodes = (nodes: FileNode[]): FileNode[] => {
			return nodes.sort((a, b) => {
				if (a.type !== b.type) {
					return a.type === "folder" ? -1 : 1;
				}
				return a.name.localeCompare(b.name);
			});
		};

		const sortRecursive = (nodes: FileNode[]): FileNode[] => {
			return sortNodes(nodes).map((node) => {
				if (node.children) {
					node.children = sortRecursive(node.children);
				}
				return node;
			});
		};

		return sortRecursive(root);
	};

	const toggleFolder = (path: string) => {
		setExpandedFolders((prev) => {
			const next = new Set(prev);
			if (next.has(path)) {
				next.delete(path);
			} else {
				next.add(path);
			}
			return next;
		});
	};

	const getFileIcon = (filename: string) => {
		const ext = filename.split(".").pop()?.toLowerCase();
		const iconColors: Record<string, string> = {
			js: "text-yellow-400",
			jsx: "text-yellow-400",
			ts: "text-blue-400",
			tsx: "text-blue-400",
			css: "text-pink-400",
			html: "text-orange-400",
			json: "text-yellow-300",
			md: "text-gray-400",
			py: "text-green-400",
			java: "text-red-400",
		};
		return iconColors[ext || ""] || "text-gray-400";
	};

	const handleStartRename = (file: CollaborationFile) => {
		setRenamingFile(file.id);
		setRenameValue(file.filename);
	};

	const handleConfirmRename = (fileId: string) => {
		if (renameValue.trim() && onRenameFile) {
			onRenameFile(fileId, renameValue.trim());
		}
		setRenamingFile(null);
		setRenameValue("");
	};

	const handleCancelRename = () => {
		setRenamingFile(null);
		setRenameValue("");
	};

	const handleCreateFile = () => {
		if (newFileName.trim() && onCreateFile) {
			onCreateFile(newFileName.trim());
			setNewFileName("");
			setShowNewFileInput(false);
		}
	};

	const renderNode = (node: FileNode, depth: number = 0): JSX.Element => {
		const isExpanded = expandedFolders.has(node.path);
		const isActive = node.file && activeFile === node.file.filename;
		const isRenaming = node.file && renamingFile === node.file.id;
		const paddingLeft = isMobile ? depth * 12 + 8 : depth * 16 + 12;

		if (node.type === "folder") {
			return (
				<div key={node.path}>
					<div
						className="flex items-center py-1.5 px-2 hover:bg-gray-700 cursor-pointer rounded"
						style={{ paddingLeft }}
						onClick={() => toggleFolder(node.path)}
					>
						<span className="mr-1 text-gray-400">
							{isExpanded ? (
								<ChevronDown size={14} />
							) : (
								<ChevronRight size={14} />
							)}
						</span>
						<span className="mr-2 text-yellow-400">
							{isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
						</span>
						<span className="text-sm text-gray-300">{node.name}</span>
					</div>
					{isExpanded && node.children && (
						<div>
							{node.children.map((child) => renderNode(child, depth + 1))}
						</div>
					)}
				</div>
			);
		}

		return (
			<div
				key={node.path}
				className={`flex items-center justify-between py-1.5 px-2 hover:bg-gray-700 cursor-pointer rounded group ${
					isActive ? "bg-gray-700" : ""
				}`}
				style={{ paddingLeft }}
				onClick={() => !isRenaming && setActiveFile(node.file!.filename)}
			>
				<div className="flex items-center flex-1 min-w-0">
					<File
						size={16}
						className={`mr-2 flex-shrink-0 ${getFileIcon(node.name)}`}
					/>
					{isRenaming ? (
						<div
							className="flex items-center flex-1"
							onClick={(e) => e.stopPropagation()}
						>
							<input
								type="text"
								value={renameValue}
								onChange={(e) => setRenameValue(e.target.value)}
								className="flex-1 bg-gray-800 text-white text-sm px-2 py-0.5 rounded border border-gray-600 focus:outline-none focus:border-[#5bc6ca]"
								onKeyDown={(e) => {
									if (e.key === "Enter") handleConfirmRename(node.file!.id);
									if (e.key === "Escape") handleCancelRename();
								}}
								autoFocus
							/>
							<button
								onClick={() => handleConfirmRename(node.file!.id)}
								className="ml-1 p-1 hover:bg-gray-600 rounded text-green-400"
							>
								<Check size={14} />
							</button>
							<button
								onClick={handleCancelRename}
								className="ml-1 p-1 hover:bg-gray-600 rounded text-red-400"
							>
								<X size={14} />
							</button>
						</div>
					) : (
						<span
							className={`text-sm truncate ${
								isActive ? "text-white" : "text-gray-300"
							}`}
						>
							{node.name}
						</span>
					)}
				</div>

				{!isRenaming && (
					<div className="hidden group-hover:flex items-center space-x-1">
						{onRenameFile && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									handleStartRename(node.file!);
								}}
								className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white"
							>
								<Edit2 size={12} />
							</button>
						)}
						{onDeleteFile && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									if (confirm(`Delete "${node.name}"?`)) {
										onDeleteFile(node.file!.id);
									}
								}}
								className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-red-400"
							>
								<Trash2 size={12} />
							</button>
						)}
					</div>
				)}
			</div>
		);
	};

	const fileTree = buildFileTree(files);

	return (
		<div
			className={`bg-[#252525] border-r border-gray-700 overflow-y-auto ${
				isMobile ? "w-full" : "w-56"
			}`}
		>
			{/* Header */}
			<div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
				<span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
					Files
				</span>
				{onCreateFile && (
					<button
						onClick={() => setShowNewFileInput(true)}
						className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
						title="New File"
					>
						<Plus size={14} />
					</button>
				)}
			</div>

			{/* New File Input */}
			{showNewFileInput && (
				<div className="px-3 py-2 border-b border-gray-700">
					<div className="flex items-center">
						<input
							type="text"
							value={newFileName}
							onChange={(e) => setNewFileName(e.target.value)}
							placeholder="filename.js"
							className="flex-1 bg-gray-800 text-white text-sm px-2 py-1 rounded border border-gray-600 focus:outline-none focus:border-[#5bc6ca]"
							onKeyDown={(e) => {
								if (e.key === "Enter") handleCreateFile();
								if (e.key === "Escape") {
									setShowNewFileInput(false);
									setNewFileName("");
								}
							}}
							autoFocus
						/>
						<button
							onClick={handleCreateFile}
							className="ml-1 p-1 hover:bg-gray-600 rounded text-green-400"
						>
							<Check size={14} />
						</button>
						<button
							onClick={() => {
								setShowNewFileInput(false);
								setNewFileName("");
							}}
							className="ml-1 p-1 hover:bg-gray-600 rounded text-red-400"
						>
							<X size={14} />
						</button>
					</div>
				</div>
			)}

			{/* File Tree */}
			<div className="py-1">
				{fileTree.length === 0 ? (
					<div className="px-3 py-4 text-center text-gray-500 text-sm">
						No files yet
					</div>
				) : (
					fileTree.map((node) => renderNode(node))
				)}
			</div>
		</div>
	);
};

export default FileExplorer;
