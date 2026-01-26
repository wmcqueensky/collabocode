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
		<div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
			<div className="flex flex-col md:flex-row items-start md:items-center gap-6">
				<div className="w-24 h-24 rounded-full bg-sky-600 flex items-center justify-center text-4xl font-bold text-white">
					{avatarLetter}
				</div>
				<div className="flex-1">
					<h1 className="text-3xl font-bold text-gray-900 mb-1">{username}</h1>
					{profile.full_name && (
						<p className="text-gray-600 mb-2">{profile.full_name}</p>
					)}
					<div className="flex flex-wrap items-center gap-4">
						<div className="flex items-center space-x-2">
							<Trophy size={18} className="text-yellow-500" />
							<span className="font-semibold text-gray-900">{matchRating}</span>
							<span className="text-gray-500 text-sm">(Match)</span>
						</div>
						<div className="flex items-center space-x-2">
							<Users size={18} className="text-purple-600" />
							<span className="font-semibold text-gray-900">
								{collaborationRating}
							</span>
							<span className="text-gray-500 text-sm">(Collab)</span>
						</div>
						<div className="flex items-center space-x-2">
							<Calendar size={18} className="text-gray-500" />
							<span className="text-gray-500 text-sm">
								Joined {formatDate(profile.created_at)}
							</span>
						</div>
					</div>
				</div>
				<Link
					to="/settings"
					className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
				>
					Edit Profile
				</Link>
			</div>
		</div>
	);
};

export default ProfileHeader;
