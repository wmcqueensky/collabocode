import { supabase } from "../lib/supabase";

export interface CollaborationFile {
	id: string;
	session_id: string;
	filename: string;
	language: string;
	content: string;
	created_by: string;
	created_at: string;
	updated_at: string;
}

export const collaborationService = {
	/**
	 * Initialize collaboration files for a session from problem starter code
	 */
	async initializeSessionFiles(
		sessionId: string,
		problemId: string
	): Promise<CollaborationFile[]> {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("Not authenticated");

		// Check if files already exist for this session
		const { data: existingFiles } = await supabase
			.from("collaboration_files")
			.select("*")
			.eq("session_id", sessionId);

		if (existingFiles && existingFiles.length > 0) {
			return existingFiles;
		}

		// Get problem with multi-file starter code
		const { data: problem, error: problemError } = await supabase
			.from("problems")
			.select("multi_file_starter_code, starter_code")
			.eq("id", problemId)
			.single();

		if (problemError) throw problemError;

		let filesToCreate: {
			filename: string;
			language: string;
			content: string;
		}[] = [];

		// Use multi-file starter code if available
		if (problem.multi_file_starter_code?.files) {
			filesToCreate = problem.multi_file_starter_code.files.map((f: any) => ({
				filename: f.name,
				language: f.language || "javascript",
				content: f.content || "",
			}));
		} else if (problem.starter_code) {
			// Fall back to single file starter code
			const starterCode = problem.starter_code;
			filesToCreate = [
				{
					filename: "main.js",
					language: "javascript",
					content:
						starterCode.javascript ||
						starterCode.python ||
						"// Start coding here",
				},
			];
		} else {
			// Default file
			filesToCreate = [
				{
					filename: "main.js",
					language: "javascript",
					content:
						"// Start coding here\n\nfunction solution() {\n  // TODO: Implement\n}\n\nmodule.exports = { solution };",
				},
			];
		}

		// Insert files
		const { data: createdFiles, error: insertError } = await supabase
			.from("collaboration_files")
			.insert(
				filesToCreate.map((f) => ({
					session_id: sessionId,
					filename: f.filename,
					language: f.language,
					content: f.content,
					created_by: user.id,
				}))
			)
			.select();

		if (insertError) throw insertError;

		return createdFiles || [];
	},

	/**
	 * Get all files for a session
	 */
	async getSessionFiles(sessionId: string): Promise<CollaborationFile[]> {
		const { data, error } = await supabase
			.from("collaboration_files")
			.select("*")
			.eq("session_id", sessionId)
			.order("created_at", { ascending: true });

		if (error) throw error;
		return data || [];
	},

	/**
	 * Update a file's content
	 */
	async updateFileContent(
		fileId: string,
		content: string
	): Promise<CollaborationFile> {
		const { data, error } = await supabase
			.from("collaboration_files")
			.update({ content, updated_at: new Date().toISOString() })
			.eq("id", fileId)
			.select()
			.single();

		if (error) throw error;
		return data;
	},

	/**
	 * Create a new file in the session
	 */
	async createFile(
		sessionId: string,
		filename: string,
		language: string = "javascript",
		content: string = ""
	): Promise<CollaborationFile> {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) throw new Error("Not authenticated");

		const { data, error } = await supabase
			.from("collaboration_files")
			.insert({
				session_id: sessionId,
				filename,
				language,
				content,
				created_by: user.id,
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	},

	/**
	 * Delete a file from the session
	 */
	async deleteFile(fileId: string): Promise<void> {
		const { error } = await supabase
			.from("collaboration_files")
			.delete()
			.eq("id", fileId);

		if (error) throw error;
	},

	/**
	 * Rename a file
	 */
	async renameFile(
		fileId: string,
		newFilename: string
	): Promise<CollaborationFile> {
		const { data, error } = await supabase
			.from("collaboration_files")
			.update({ filename: newFilename, updated_at: new Date().toISOString() })
			.eq("id", fileId)
			.select()
			.single();

		if (error) throw error;
		return data;
	},

	/**
	 * Subscribe to file changes for real-time collaboration
	 */
	subscribeToFileChanges(
		sessionId: string,
		onFileChange: (file: CollaborationFile) => void,
		onFileCreate: (file: CollaborationFile) => void,
		onFileDelete: (fileId: string) => void
	) {
		const channel = supabase
			.channel(`collaboration-files:${sessionId}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "collaboration_files",
					filter: `session_id=eq.${sessionId}`,
				},
				(payload) => {
					onFileChange(payload.new as CollaborationFile);
				}
			)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "collaboration_files",
					filter: `session_id=eq.${sessionId}`,
				},
				(payload) => {
					onFileCreate(payload.new as CollaborationFile);
				}
			)
			.on(
				"postgres_changes",
				{
					event: "DELETE",
					schema: "public",
					table: "collaboration_files",
					filter: `session_id=eq.${sessionId}`,
				},
				(payload) => {
					onFileDelete((payload.old as any).id);
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	},

	/**
	 * Get language from filename extension
	 */
	getLanguageFromFilename(filename: string): string {
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
		};
		return languageMap[ext || ""] || "javascript";
	},
};

export default collaborationService;
