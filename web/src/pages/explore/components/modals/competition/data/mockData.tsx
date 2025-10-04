// Mock data for the LeetCode modal

export const getLeetCodeProblems = () => {
	return [
		{
			id: "lc-1",
			title: "Two Sum",
			description:
				"Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
			difficulty: "Easy",
			tags: ["Array", "Hash Table"],
			rating: 4.8,
			timeLimit: 30,
		},
		{
			id: "lc-2",
			title: "Add Two Numbers",
			description:
				"You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each node contains a single digit.",
			difficulty: "Medium",
			tags: ["Linked List", "Math", "Recursion"],
			rating: 4.5,
			timeLimit: 45,
		},
		{
			id: "lc-3",
			title: "Longest Substring Without Repeating Characters",
			description:
				"Given a string s, find the length of the longest substring without repeating characters.",
			difficulty: "Medium",
			tags: ["Hash Table", "String", "Sliding Window"],
			rating: 4.6,
			timeLimit: 45,
		},
		{
			id: "lc-4",
			title: "Median of Two Sorted Arrays",
			description:
				"Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
			difficulty: "Hard",
			tags: ["Array", "Binary Search", "Divide and Conquer"],
			rating: 4.3,
			timeLimit: 60,
		},
		{
			id: "lc-5",
			title: "Longest Palindromic Substring",
			description:
				"Given a string s, return the longest palindromic substring in s.",
			difficulty: "Medium",
			tags: ["String", "Dynamic Programming"],
			rating: 4.4,
			timeLimit: 45,
		},
		{
			id: "lc-6",
			title: "Valid Parentheses",
			description:
				"Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
			difficulty: "Easy",
			tags: ["String", "Stack"],
			rating: 4.9,
			timeLimit: 30,
		},
		{
			id: "lc-7",
			title: "Merge Two Sorted Lists",
			description:
				"Merge two sorted linked lists and return it as a sorted list.",
			difficulty: "Easy",
			tags: ["Linked List", "Recursion"],
			rating: 4.7,
			timeLimit: 30,
		},
		{
			id: "lc-8",
			title: "Maximum Subarray",
			description:
				"Find the contiguous subarray which has the largest sum and return its sum.",
			difficulty: "Easy",
			tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
			rating: 4.6,
			timeLimit: 30,
		},
		{
			id: "lc-9",
			title: "Binary Tree Level Order Traversal",
			description:
				"Given the root of a binary tree, return the level order traversal of its nodes' values.",
			difficulty: "Medium",
			tags: ["Tree", "BFS", "Binary Tree"],
			rating: 4.5,
			timeLimit: 45,
		},
		{
			id: "lc-10",
			title: "Merge k Sorted Lists",
			description:
				"You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.",
			difficulty: "Hard",
			tags: ["Linked List", "Divide and Conquer", "Heap"],
			rating: 4.2,
			timeLimit: 60,
		},
	];
};

export const getAvailablePlayers = () => {
	return [
		{
			id: "user-1",
			name: "Alex Johnson",
			username: "alexcode",
			avatar: null,
			online: true,
			rating: 1850,
			problemsSolved: 127,
			matchHistory: ["win", "win", "loss", "win", "win"],
		},
		{
			id: "user-2",
			name: "Samantha Lee",
			username: "samcodes",
			avatar: null,
			online: true,
			rating: 2100,
			problemsSolved: 215,
			matchHistory: ["win", "win", "win", "win", "loss"],
		},
		{
			id: "user-3",
			name: "Michael Chen",
			username: "mikedev",
			avatar: null,
			online: true,
			rating: 1950,
			problemsSolved: 156,
			matchHistory: ["loss", "win", "win", "win", "win"],
		},
		{
			id: "user-4",
			name: "Emily Rodriguez",
			username: "emilyr",
			avatar: null,
			online: false,
			rating: 1750,
			problemsSolved: 98,
			matchHistory: ["win", "loss", "loss", "win", "win"],
		},
		{
			id: "user-5",
			name: "Jamal Wilson",
			username: "jamalw",
			avatar: null,
			online: true,
			rating: 2250,
			problemsSolved: 287,
			matchHistory: ["win", "win", "win", "loss", "win"],
		},
		{
			id: "user-6",
			name: "Sophie Kim",
			username: "sophiek",
			avatar: null,
			online: true,
			rating: 1980,
			problemsSolved: 173,
			matchHistory: ["loss", "win", "win", "win", "loss"],
		},
		{
			id: "user-7",
			name: "David Patel",
			username: "davep",
			avatar: null,
			online: false,
			rating: 1650,
			problemsSolved: 78,
			matchHistory: ["win", "loss", "win", "loss", "win"],
		},
		{
			id: "user-8",
			name: "Grace Liu",
			username: "gracel",
			avatar: null,
			online: true,
			rating: 2050,
			problemsSolved: 198,
			matchHistory: ["win", "win", "loss", "win", "win"],
		},
	];
};
