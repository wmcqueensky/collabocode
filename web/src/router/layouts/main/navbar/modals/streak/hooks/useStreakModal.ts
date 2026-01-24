import { useEffect, useState, useRef } from "react";

interface UseStreakModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function useStreakModal({ isOpen, onClose }: UseStreakModalProps) {
	const [animateIn, setAnimateIn] = useState(false);
	const [showConfetti, setShowConfetti] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null);

	// Handle animation states
	useEffect(() => {
		if (isOpen) {
			setTimeout(() => setAnimateIn(true), 50);
			setTimeout(() => setShowConfetti(true), 300);
		} else {
			setAnimateIn(false);
			setShowConfetti(false);
		}
	}, [isOpen]);

	// Handle outside click
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				modalRef.current &&
				!modalRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	// Handle escape key
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen, onClose]);

	return {
		animateIn,
		showConfetti,
		modalRef,
	};
}
