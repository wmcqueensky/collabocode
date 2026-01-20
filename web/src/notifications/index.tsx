import { useNavigate } from "react-router-dom";
import type { NotificationCenterProps, Notification } from "./types";
import { useNotifications } from "./hooks/useNotifications";
import { useDropdown } from "./hooks/useDropdown";
import { BellButton } from "./components/BellButton";
import { NotificationHeader } from "./components/NotificationHeader";
import { NotificationList } from "./components/NotificationList";

const NotificationCenter = ({
	onOpenChange,
	closeSignal,
}: NotificationCenterProps = {}) => {
	const navigate = useNavigate();
	const {
		notifications,
		loading,
		unreadCount,
		acceptInvite,
		declineInvite,
		markAsReadAndGetPath,
	} = useNotifications();

	const { isOpen, dropdownRef, toggle, close } = useDropdown({
		onOpenChange,
		closeSignal,
	});

	const handleAcceptInvite = async (notification: Notification) => {
		try {
			const path = await acceptInvite(notification);
			if (path) {
				navigate(path);
				close();
			}
		} catch {
			alert("Failed to accept invitation");
		}
	};

	const handleDeclineInvite = async (notification: Notification) => {
		try {
			await declineInvite(notification);
		} catch {
			alert("Failed to decline invitation");
		}
	};

	const handleViewSummary = async (notification: Notification) => {
		const path = await markAsReadAndGetPath(notification);
		if (path) {
			navigate(path);
			close();
		}
	};

	return (
		<div className="relative" ref={dropdownRef}>
			<BellButton unreadCount={unreadCount} onClick={toggle} />

			{isOpen && (
				<div className="absolute right-0 mt-2 w-96 bg-[#252525] border border-gray-700 rounded-lg shadow-xl z-50 max-h-[80vh] overflow-hidden flex flex-col">
					<NotificationHeader onClose={close} />

					<div className="flex-1 overflow-y-auto">
						<NotificationList
							notifications={notifications}
							loading={loading}
							onAcceptInvite={handleAcceptInvite}
							onDeclineInvite={handleDeclineInvite}
							onViewSummary={handleViewSummary}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default NotificationCenter;
