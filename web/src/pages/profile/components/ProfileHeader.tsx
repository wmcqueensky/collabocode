import { Link } from "react-router-dom";
import { Trophy, Users, Calendar } from "lucide-react";

import { formatDate } from "../constants";
import type { UserProfile } from "../types";

interface ProfileHeaderProps {
	profile: UserProfile;
	username: string;
	avatarLetter: string;
	matchRating: number;
	collaborationRating: number;
}

const ProfileHeader = ({
	profile,
	username,
	avatarLetter,
	matchRating,
	collaborationRating,
}: ProfileHeaderProps) => {
	return (
		<div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6 mb-6">
			<div className="flex flex-col md:flex-row items-start md:items-center gap-6">
				<div className="w-24 h-24 rounded-full bg-[#5bc6ca] flex items-center justify-center text-4xl font-bold">
					{avatarLetter}
				</div>
				<div className="flex-1">
					<h1 className="text-3xl font-bold mb-1">{username}</h1>
					{profile.full_name && (
						<p className="text-gray-400 mb-2">{profile.full_name}</p>
					)}
					<div className="flex flex-wrap items-center gap-4">
						<div className="flex items-center space-x-2">
							<Trophy size={18} className="text-yellow-500" />
							<span className="font-semibold text-white">{matchRating}</span>
							<span className="text-gray-400 text-sm">(Match)</span>
						</div>
						<div className="flex items-center space-x-2">
							<Users size={18} className="text-[#a78bfa]" />
							<span className="font-semibold text-white">
								{collaborationRating}
							</span>
							<span className="text-gray-400 text-sm">(Collab)</span>
						</div>
						<div className="flex items-center space-x-2">
							<Calendar size={18} className="text-gray-400" />
							<span className="text-gray-400 text-sm">
								Joined {formatDate(profile.created_at)}
							</span>
						</div>
					</div>
				</div>
				<Link
					to="/settings"
					className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
				>
					Edit Profile
				</Link>
			</div>
		</div>
	);
};

export default ProfileHeader;
