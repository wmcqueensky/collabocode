import {
	Monitor,
	Timer,
	MessageSquare,
	Puzzle,
	BarChart3,
	Link,
} from "lucide-react";

const features = [
	{
		icon: Monitor,
		title: "Real-time shared editor",
		description: "See your teammates' cursors and edits as they happen",
		color: "sky",
	},
	{
		icon: Timer,
		title: "Built-in timer and scoring",
		description: "Track your speed and compete on leaderboards",
		color: "purple",
	},
	{
		icon: MessageSquare,
		title: "Live chat & feedback",
		description: "Communicate strategies and share insights instantly",
		color: "sky",
	},
	{
		icon: Puzzle,
		title: "Problem sets + repos",
		description: "From LeetCode challenges to full codebase projects",
		color: "purple",
	},
	{
		icon: BarChart3,
		title: "Post-match analysis",
		description: "Review performance charts and improve over time",
		color: "sky",
	},
	{
		icon: Link,
		title: "Instant sharing",
		description: "Share a link and start coding together in seconds",
		color: "purple",
	},
];

const Features = () => {
	return (
		<section id="features" className="bg-gray-50 py-20 px-4 sm:px-6">
			<div className="max-w-5xl mx-auto space-y-12">
				<div className="text-center">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
						Everything You Need
					</h2>
					<p className="text-gray-600">
						Powerful features designed for seamless collaboration
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{features.map((feature, index) => {
						const Icon = feature.icon;
						const isSky = feature.color === "sky";
						const bgColor = isSky ? "bg-sky-100" : "bg-purple-100";
						const textColor = isSky ? "text-sky-600" : "text-purple-600";

						return (
							<div
								key={index}
								className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-sm"
							>
								<div
									className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
								>
									<Icon size={24} className={textColor} />
								</div>
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									{feature.title}
								</h3>
								<p className="text-gray-600 text-sm leading-relaxed">
									{feature.description}
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default Features;
