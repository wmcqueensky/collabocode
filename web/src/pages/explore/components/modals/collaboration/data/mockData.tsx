export interface Problem {
	id: number;
	title: string;
	description: string;
	difficulty: string;
	estimatedTime: string;
	technologies: string[];
	languages: string[];
}

export interface Player {
	id: string;
	name: string;
	username: string;
	avatar: string | null;
	online: boolean;
	rating: number;
	specialty: string;
	problemsSolved: number;
	matchHistory: string[];
}

// Problems data
export function getProblemData() {
	return [
		{
			id: 1,
			title: "Fix Checkout Calculation Bug",
			description:
				"A shopping cart totals incorrectly when multiple discount codes are applied. Debug and fix the pricing logic.",
			difficulty: "easy",
			estimatedTime: "45 minutes",
			technologies: ["React", "Redux"],
			languages: ["JavaScript", "TypeScript"],
		},
		{
			id: 2,
			title: "Broken Chat Timestamps",
			description:
				"Messages in a chat app show incorrect timestamps in some timezones. Investigate and fix the formatting logic.",
			difficulty: "medium",
			estimatedTime: "1 hour",
			technologies: ["React", "Firebase"],
			languages: ["JavaScript"],
		},
		{
			id: 3,
			title: "Slow Task API Endpoint",
			description:
				"The /tasks endpoint returns results slowly. Identify the bottleneck and improve performance.",
			difficulty: "medium",
			estimatedTime: "45 minutes",
			technologies: ["Spring Boot", "MySQL"],
			languages: ["Java"],
		},
		{
			id: 4,
			title: "Weather API Crash on Edge Case",
			description:
				"The weather dashboard crashes when a non-existent city is searched. Handle the error and improve UX.",
			difficulty: "easy",
			estimatedTime: "30 minutes",
			technologies: ["React", "Axios"],
			languages: ["JavaScript", "TypeScript"],
		},
		{
			id: 5,
			title: "CMS Comments Not Saving",
			description:
				"Users report that comments occasionally don't save on blog posts. Debug the Django backend and fix the issue.",
			difficulty: "medium",
			estimatedTime: "1 hour",
			technologies: ["Django", "PostgreSQL"],
			languages: ["Python"],
		},
		{
			id: 6,
			title: "Access Control Bug in File Upload",
			description:
				"Files uploaded by one user are accessible to others. Identify the issue in the access control middleware.",
			difficulty: "medium",
			estimatedTime: "45 minutes",
			technologies: ["Node.js", "Express"],
			languages: ["JavaScript", "TypeScript"],
		},
	];
}

export const getAvailablePlayers = () => {
	return [
		{
			id: "user-1",
			name: "Alex Johnson",
			username: "alexcode",
			avatar: "/api/placeholder/40/40",
			online: true,
			rating: 1850,
			specialty: "Frontend",
			successfulCollabos: 127,
			matchHistory: ["win", "win", "loss", "win", "win"],
		},
		{
			id: "user-2",
			name: "Samantha Lee",
			username: "samcodes",
			avatar: "/api/placeholder/40/40",
			online: true,
			rating: 2100,
			specialty: "Full Stack",
			successfulCollabos: 215,
			matchHistory: ["win", "win", "win", "win", "loss"],
		},
		{
			id: "user-3",
			name: "Michael Chen",
			username: "mikedev",
			avatar: "/api/placeholder/40/40",
			online: true,
			rating: 1950,
			specialty: "Backend",
			successfulCollabos: 156,
			matchHistory: ["loss", "win", "win", "win", "win"],
		},
		{
			id: "user-4",
			name: "Emily Rodriguez",
			username: "emilyr",
			avatar: "/api/placeholder/40/40",
			online: false,
			rating: 1750,
			specialty: "DevOps",
			successfulCollabos: 98,
			matchHistory: ["win", "loss", "loss", "win", "win"],
		},
		{
			id: "user-5",
			name: "Jamal Wilson",
			username: "jamalw",
			avatar: "/api/placeholder/40/40",
			online: true,
			rating: 2250,
			specialty: "Frontend",
			successfulCollabos: 287,
			matchHistory: ["win", "win", "win", "loss", "win"],
		},
		{
			id: "user-6",
			name: "Sophie Kim",
			username: "sophiek",
			avatar: "/api/placeholder/40/40",
			online: true,
			rating: 1980,
			specialty: "Backend",
			successfulCollabos: 173,
			matchHistory: ["loss", "win", "win", "win", "loss"],
		},
		{
			id: "user-7",
			name: "David Patel",
			username: "davep",
			avatar: "/api/placeholder/40/40",
			online: false,
			rating: 1650,
			specialty: "DevOps",
			successfulCollabos: 78,
			matchHistory: ["win", "loss", "win", "loss", "win"],
		},
		{
			id: "user-8",
			name: "Grace Liu",
			username: "gracel",
			avatar: "/api/placeholder/40/40",
			online: true,
			rating: 2050,
			specialty: "Full Stack",
			successfulCollabos: 198,
			matchHistory: ["win", "win", "loss", "win", "win"],
		},
	];
};
