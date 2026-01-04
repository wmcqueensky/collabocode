import { useState, useRef, useEffect } from "react";
import { Code, X } from "lucide-react";
import type { CollaborationFile } from "../../../services/collaborationService";

interface FileTabsProps {
	files: CollaborationFile[];
	activeFile: string | null;
	setActiveFile: (filename: string) => void;
	openTabs: string[];
	setOpenTabs: (tabs: string[]) => void;
}

export const FileTabs = ({
	files,
	activeFile,
	setActiveFile,
	openTabs,
	setOpenTabs,
}: FileTabsProps) => {
	const [draggingTab, setDraggingTab] = useState<string | null>(null);
	const [dragOverTab, setDragOverTab] = useState<string | null>(null);
	const tabsRef = useRef<HTMLDivElement>(null);

	// Get file icon color based on extension
	const getFileIconColor = (filename: string) => {
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

	// Close a tab
	const closeTab = (e: React.MouseEvent, filename: string) => {
		e.stopPropagation();

		const newOpenTabs = openTabs.filter((tab) => tab !== filename);

		if (newOpenTabs.length === 0) {
			setOpenTabs([]);
			setActiveFile("");
		} else if (activeFile === filename) {
			const closedTabIndex = openTabs.indexOf(filename);
			const newActiveTab =
				newOpenTabs[closedTabIndex] ||
				newOpenTabs[closedTabIndex - 1] ||
				newOpenTabs[0];
			setOpenTabs(newOpenTabs);
			setActiveFile(newActiveTab);
		} else {
			setOpenTabs(newOpenTabs);
		}
	};

	// Drag and drop handlers
	const handleDragStart = (filename: string) => {
		setDraggingTab(filename);
	};

	const handleDragOver = (e: React.DragEvent, filename: string) => {
		e.preventDefault();
		if (draggingTab !== filename) {
			setDragOverTab(filename);
		}
	};

	const handleDrop = (e: React.DragEvent, targetFilename: string) => {
		e.preventDefault();

		if (draggingTab && draggingTab !== targetFilename) {
			const newOpenTabs = [...openTabs];
			const dragTabIndex = newOpenTabs.indexOf(draggingTab);
			const dropTabIndex = newOpenTabs.indexOf(targetFilename);

			newOpenTabs.splice(dragTabIndex, 1);
			newOpenTabs.splice(dropTabIndex, 0, draggingTab);

			setOpenTabs(newOpenTabs);
		}

		setDraggingTab(null);
		setDragOverTab(null);
	};

	const handleDragEnd = () => {
		setDraggingTab(null);
		setDragOverTab(null);
	};

	// Scroll active tab into view
	useEffect(() => {
		if (tabsRef.current && activeFile) {
			const activeTabElement = tabsRef.current.querySelector(
				`[data-filename="${activeFile}"]`
			);
			if (activeTabElement) {
				activeTabElement.scrollIntoView({
					behavior: "smooth",
					block: "nearest",
					inline: "nearest",
				});
			}
		}
	}, [activeFile]);

	// Get display name (last part of path)
	const getDisplayName = (filename: string) => {
		const parts = filename.split("/");
		return parts[parts.length - 1];
	};

	return (
		<div
			ref={tabsRef}
			className="flex flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
		>
			{openTabs.map((tabName) => {
				const file = files.find((f) => f.filename === tabName);
				if (!file) return null;

				const isActive = activeFile === file.filename;
				const isDragging = draggingTab === file.filename;
				const isDragOver = dragOverTab === file.filename;
				const displayName = getDisplayName(file.filename);

				return (
					<div
						key={file.filename}
						data-filename={file.filename}
						className={`
              px-3 py-2 text-sm flex items-center space-x-2 cursor-pointer select-none
              border-r border-gray-700 min-w-0 flex-shrink-0
              ${
								isActive
									? "bg-[#1e1e1e] border-b-2 border-b-[#5bc6ca] text-white"
									: "bg-[#2c2c2c] text-gray-400 hover:bg-[#333]"
							}
              ${isDragging ? "opacity-50" : ""}
              ${isDragOver ? "border-l-2 border-l-[#5bc6ca]" : ""}
            `}
						draggable={true}
						onClick={() => setActiveFile(file.filename)}
						onDragStart={() => handleDragStart(file.filename)}
						onDragOver={(e) => handleDragOver(e, file.filename)}
						onDrop={(e) => handleDrop(e, file.filename)}
						onDragEnd={handleDragEnd}
					>
						<Code size={14} className={getFileIconColor(displayName)} />
						<span className="truncate max-w-[100px]" title={file.filename}>
							{displayName}
						</span>
						<button
							className="ml-1 text-gray-500 hover:text-white hover:bg-gray-600 rounded-full p-0.5 flex-shrink-0"
							onClick={(e) => closeTab(e, file.filename)}
						>
							<X size={12} />
						</button>
					</div>
				);
			})}
		</div>
	);
};

export default FileTabs;
