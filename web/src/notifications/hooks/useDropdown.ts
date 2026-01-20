import { useState, useEffect, useRef } from "react";

interface UseDropdownOptions {
	onOpenChange?: (isOpen: boolean) => void;
	closeSignal?: number;
}

export const useDropdown = ({
	onOpenChange,
	closeSignal,
}: UseDropdownOptions) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const prevCloseSignal = useRef(closeSignal);

	// Notify parent when dropdown state changes
	useEffect(() => {
		onOpenChange?.(isOpen);
	}, [isOpen, onOpenChange]);

	// Close dropdown when closeSignal prop changes
	useEffect(() => {
		if (closeSignal !== undefined && closeSignal !== prevCloseSignal.current) {
			prevCloseSignal.current = closeSignal;
			setIsOpen(false);
		}
	}, [closeSignal]);

	// Handle click outside to close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	// Handle escape key
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen]);

	const toggle = () => setIsOpen((prev) => !prev);
	const close = () => setIsOpen(false);

	return {
		isOpen,
		dropdownRef,
		toggle,
		close,
	};
};
