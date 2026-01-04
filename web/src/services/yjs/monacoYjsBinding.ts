import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import type { editor as MonacoEditor, IDisposable } from "monaco-editor";
import type { UserAwareness } from "./collaborationDocument";

// Cursor decoration styles
const createCursorStyles = () => {
	const styleSheet = document.createElement("style");
	styleSheet.id = "yjs-cursor-styles";
	styleSheet.textContent = `
		.yjs-cursor {
			position: absolute;
			width: 2px !important;
			pointer-events: none;
			z-index: 1000;
		}
		
		.yjs-cursor-label {
			position: absolute;
			top: -18px;
			left: 0;
			padding: 2px 6px;
			border-radius: 3px;
			font-size: 10px;
			font-weight: 600;
			white-space: nowrap;
			pointer-events: none;
			z-index: 1001;
			opacity: 0;
			transition: opacity 0.15s ease;
		}
		
		.yjs-cursor:hover .yjs-cursor-label,
		.yjs-cursor-label.visible {
			opacity: 1;
		}
		
		.yjs-selection {
			position: absolute;
			pointer-events: none;
			z-index: 999;
		}
	`;

	if (!document.getElementById("yjs-cursor-styles")) {
		document.head.appendChild(styleSheet);
	}
};

export class MonacoYjsBinding {
	private editor: MonacoEditor.IStandaloneCodeEditor;
	private ytext: Y.Text;
	private awareness: Awareness;
	private disposables: IDisposable[] = [];
	private cursorDecorations: string[] = [];
	private isApplyingRemoteChange: boolean = false;
	private isLocalChange: boolean = false;
	private userId: string;
	private savedSelection: { anchor: number; head: number } | null = null;

	constructor(
		editor: MonacoEditor.IStandaloneCodeEditor,
		ytext: Y.Text,
		awareness: Awareness,
		userId: string
	) {
		this.editor = editor;
		this.ytext = ytext;
		this.awareness = awareness;
		this.userId = userId;

		createCursorStyles();
		this.setupBindings();
	}

	private setupBindings() {
		// Sync initial content from Yjs to Monaco
		const initialContent = this.ytext.toString();
		const model = this.editor.getModel();
		if (model && model.getValue() !== initialContent) {
			this.isApplyingRemoteChange = true;
			model.setValue(initialContent);
			this.isApplyingRemoteChange = false;
		}

		// Listen to Monaco changes and apply to Yjs
		const contentChangeDisposable = this.editor.onDidChangeModelContent(
			(event) => {
				// Ignore changes that came from applying remote Yjs updates
				if (this.isApplyingRemoteChange) return;

				this.isLocalChange = true;

				this.ytext.doc?.transact(() => {
					// Apply changes in reverse order to maintain correct offsets
					const sortedChanges = [...event.changes].sort(
						(a, b) => b.rangeOffset - a.rangeOffset
					);

					sortedChanges.forEach((change) => {
						if (change.rangeLength > 0) {
							this.ytext.delete(change.rangeOffset, change.rangeLength);
						}
						if (change.text) {
							this.ytext.insert(change.rangeOffset, change.text);
						}
					});
				}, "local"); // Mark as local origin

				this.isLocalChange = false;
			}
		);
		this.disposables.push(contentChangeDisposable);

		// Listen to Yjs changes and apply to Monaco
		const yjsObserver = (event: Y.YTextEvent, transaction: Y.Transaction) => {
			// Skip if this is a local change (we already have it in Monaco)
			if (transaction.origin === "local") return;
			if (this.isLocalChange) return;

			this.isApplyingRemoteChange = true;

			const model = this.editor.getModel();
			if (!model) {
				this.isApplyingRemoteChange = false;
				return;
			}

			// Save current cursor position BEFORE applying changes
			const selection = this.editor.getSelection();
			let cursorOffset: number | null = null;
			if (selection) {
				cursorOffset = model.getOffsetAt(selection.getPosition());
			}

			// Apply Yjs changes to Monaco
			let index = 0;
			const edits: { range: any; text: string }[] = [];

			event.delta.forEach((op) => {
				if (op.retain !== undefined) {
					index += op.retain;
				} else if (op.insert !== undefined) {
					const pos = model.getPositionAt(index);
					const text = typeof op.insert === "string" ? op.insert : "";
					edits.push({
						range: {
							startLineNumber: pos.lineNumber,
							startColumn: pos.column,
							endLineNumber: pos.lineNumber,
							endColumn: pos.column,
						},
						text,
					});
					index += text.length;
				} else if (op.delete !== undefined) {
					const startPos = model.getPositionAt(index);
					const endPos = model.getPositionAt(index + op.delete);
					edits.push({
						range: {
							startLineNumber: startPos.lineNumber,
							startColumn: startPos.column,
							endLineNumber: endPos.lineNumber,
							endColumn: endPos.column,
						},
						text: "",
					});
				}
			});

			// Apply all edits at once
			if (edits.length > 0) {
				model.applyEdits(edits);
			}

			// Restore cursor position
			// The cursor should stay where it was (or adjust if text was inserted before it)
			if (cursorOffset !== null && selection) {
				// Recalculate cursor position based on the Yjs changes
				let newOffset = cursorOffset;

				// Adjust offset based on insertions/deletions that occurred before the cursor
				let deltaIndex = 0;
				event.delta.forEach((op) => {
					if (op.retain !== undefined) {
						deltaIndex += op.retain;
					} else if (op.insert !== undefined) {
						const insertLength =
							typeof op.insert === "string" ? op.insert.length : 0;
						// If insertion happened before our cursor, shift our cursor
						if (deltaIndex < cursorOffset!) {
							newOffset += insertLength;
						}
						deltaIndex += insertLength;
					} else if (op.delete !== undefined) {
						// If deletion happened before our cursor, shift our cursor back
						if (deltaIndex < cursorOffset!) {
							const deleteEnd = deltaIndex + op.delete;
							if (deleteEnd <= cursorOffset!) {
								// Entire deletion is before cursor
								newOffset -= op.delete;
							} else if (deltaIndex < cursorOffset!) {
								// Deletion partially overlaps cursor position
								newOffset -= cursorOffset! - deltaIndex;
							}
						}
					}
				});

				// Ensure offset is valid
				newOffset = Math.max(0, Math.min(newOffset, model.getValue().length));

				// Set the cursor position
				const newPos = model.getPositionAt(newOffset);
				this.editor.setPosition(newPos);
			}

			this.isApplyingRemoteChange = false;
		};
		this.ytext.observe(yjsObserver);

		// Track cursor position changes - update awareness
		const cursorChangeDisposable = this.editor.onDidChangeCursorPosition(
			(event) => {
				// Don't update awareness during remote changes
				if (this.isApplyingRemoteChange) return;

				const selection = this.editor.getSelection();
				const model = this.editor.getModel();
				if (!selection || !model) return;

				const anchor = model.getOffsetAt(selection.getStartPosition());
				const head = model.getOffsetAt(selection.getEndPosition());

				const localState = this.awareness.getLocalState() as UserAwareness;
				if (localState) {
					this.awareness.setLocalState({
						...localState,
						cursor: {
							anchor,
							head,
							lineNumber: event.position.lineNumber,
							column: event.position.column,
						},
					});
				}
			}
		);
		this.disposables.push(cursorChangeDisposable);

		// Listen to awareness changes for remote cursors
		const awarenessChangeHandler = () => {
			this.updateRemoteCursors();
		};
		this.awareness.on("change", awarenessChangeHandler);

		// Initial cursor render
		this.updateRemoteCursors();

		// Cleanup Yjs observer on dispose
		this.disposables.push({
			dispose: () => {
				this.ytext.unobserve(yjsObserver);
				this.awareness.off("change", awarenessChangeHandler);
			},
		});
	}

	private updateRemoteCursors() {
		const model = this.editor.getModel();
		if (!model) return;

		const states = this.awareness.getStates();
		const newDecorations: MonacoEditor.IModelDeltaDecoration[] = [];

		states.forEach((state, clientId) => {
			const userState = state as UserAwareness;

			// Skip local user - we don't need to show our own remote cursor
			if (userState.user?.id === this.userId) return;
			if (!userState.cursor || !userState.user) return;

			const { cursor, user } = userState;

			try {
				// Validate cursor positions
				const maxOffset = model.getValue().length;
				const anchorOffset = Math.min(Math.max(0, cursor.anchor), maxOffset);
				const headOffset = Math.min(Math.max(0, cursor.head), maxOffset);

				const startPos = model.getPositionAt(
					Math.min(anchorOffset, headOffset)
				);
				const endPos = model.getPositionAt(Math.max(anchorOffset, headOffset));

				// Cursor line decoration (the blinking cursor indicator)
				newDecorations.push({
					range: {
						startLineNumber: endPos.lineNumber,
						startColumn: endPos.column,
						endLineNumber: endPos.lineNumber,
						endColumn: endPos.column + 1,
					},
					options: {
						className: `yjs-cursor`,
						hoverMessage: { value: user.name },
						stickiness: 1,
						// We'll apply color via DOM manipulation
					},
				});

				// Selection decoration (if there's a selection)
				if (anchorOffset !== headOffset) {
					newDecorations.push({
						range: {
							startLineNumber: startPos.lineNumber,
							startColumn: startPos.column,
							endLineNumber: endPos.lineNumber,
							endColumn: endPos.column,
						},
						options: {
							className: `yjs-selection`,
							stickiness: 1,
						},
					});
				}
			} catch (e) {
				// Position might be invalid if content changed
				console.warn("Error updating cursor position:", e);
			}
		});

		// Apply decorations
		this.cursorDecorations = this.editor.deltaDecorations(
			this.cursorDecorations,
			newDecorations
		);

		// Update cursor colors via DOM manipulation (Monaco doesn't support dynamic colors in decorations)
		this.updateCursorColors();
	}

	private updateCursorColors() {
		const states = this.awareness.getStates();

		requestAnimationFrame(() => {
			const cursorElements = document.querySelectorAll(".yjs-cursor");
			const selectionElements = document.querySelectorAll(".yjs-selection");

			let cursorIndex = 0;
			states.forEach((state) => {
				const userState = state as UserAwareness;
				if (userState.user?.id === this.userId) return;
				if (!userState.cursor || !userState.user) return;

				const { user } = userState;

				// Style cursor
				if (cursorElements[cursorIndex]) {
					const cursorEl = cursorElements[cursorIndex] as HTMLElement;
					cursorEl.style.backgroundColor = user.color;

					// Add or update label
					let label = cursorEl.querySelector(
						".yjs-cursor-label"
					) as HTMLElement;
					if (!label) {
						label = document.createElement("div");
						label.className = "yjs-cursor-label visible";
						cursorEl.appendChild(label);

						// Hide label after 2 seconds
						setTimeout(() => {
							label.classList.remove("visible");
						}, 2000);
					}
					label.textContent = user.name;
					label.style.backgroundColor = user.color;
					label.style.color = this.getContrastColor(user.color);
				}

				// Style selection
				if (selectionElements[cursorIndex]) {
					const selEl = selectionElements[cursorIndex] as HTMLElement;
					selEl.style.backgroundColor = user.colorLight || `${user.color}33`;
				}

				cursorIndex++;
			});
		});
	}

	private getContrastColor(hexColor: string): string {
		const r = parseInt(hexColor.slice(1, 3), 16);
		const g = parseInt(hexColor.slice(3, 5), 16);
		const b = parseInt(hexColor.slice(5, 7), 16);
		const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
		return luminance > 0.5 ? "#000000" : "#ffffff";
	}

	// Set content from external source (e.g., initial load from database)
	setContent(content: string) {
		if (this.ytext.toString() === "") {
			this.ytext.doc?.transact(() => {
				this.ytext.insert(0, content);
			}, "init");
		}
	}

	// Get current content
	getContent(): string {
		return this.ytext.toString();
	}

	// Cleanup
	dispose() {
		this.disposables.forEach((d) => d.dispose());
		this.disposables = [];

		// Clear decorations
		this.cursorDecorations = this.editor.deltaDecorations(
			this.cursorDecorations,
			[]
		);
	}
}

export default MonacoYjsBinding;
