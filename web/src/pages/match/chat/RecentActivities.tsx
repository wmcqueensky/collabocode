import { Check, Clock, Cpu, PlayCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export const RecentActivities = ({
  activities = [],
  isMobile = false,
}: any) => {
  const [liveActivities, setLiveActivities] = useState(activities);

  const activityIcons: any = {
    passed: Check,
    modifying: Cpu,
    ran: PlayCircle,
    failed: X,
  };

  const activityColors: any = {
    passed: 'text-green-400',
    modifying: 'text-[#5bc6ca]',
    ran: 'text-yellow-400',
    failed: 'text-red-400',
  };

  // Simulate new activities
  useEffect(() => {
    const activityTemplates = [
      { type: 'passed', user: 'Sarah', action: 'passed Test Case' },
      { type: 'modifying', user: 'Alex', action: 'is thinking' },
      { type: 'ran', user: 'Miguel', action: 'ran Test Case' },
      { type: 'failed', user: 'You', action: 'failed Test Case' },
      { type: 'passed', user: 'Miguel', action: 'passed Test Case' },
    ];

    const interval = setInterval(() => {
      if (Math.random() < 0.4) {
        // 40% chance to add new activity
        const template =
          activityTemplates[
            Math.floor(Math.random() * activityTemplates.length)
          ];
        const testCase = Math.floor(Math.random() * 4) + 1;
        const newActivity = {
          id: Date.now(),
          type: template.type,
          message:
            template.type === 'modifying'
              ? `${template.user} ${template.action}`
              : `${template.user} ${template.action} ${testCase}`,
          timestamp: 'now',
        };
        setLiveActivities((prev: any) => [newActivity, ...prev.slice(0, 4)]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col bg-[#2c2c2c] border-r border-gray-700">
      {/* Header */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-700">
        <h3
          className={`${
            isMobile ? 'text-xs' : 'text-sm'
          } font-medium text-gray-200 flex items-center`}
        >
          <Clock size={isMobile ? 14 : 16} className="mr-2 text-[#5bc6ca]" />
          Activity Feed
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-2 sm:p-4">
        <div
          className={`space-y-2 sm:space-y-3 ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}
        >
          {liveActivities.map((activity: any, index: number) => {
            const IconComponent = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];

            return (
              <div
                key={`${activity.id}-${index}`}
                className={`flex items-center ${colorClass} animate-fade-in transition-all duration-500`}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <IconComponent
                  size={isMobile ? 12 : 14}
                  className="mr-2 flex-shrink-0"
                />
                <span className="flex-1 truncate text-gray-300 min-w-0">
                  {activity.message}
                </span>
                <span
                  className={`ml-2 text-gray-500 ${
                    isMobile ? 'text-xs' : 'text-xs'
                  } flex-shrink-0`}
                >
                  {activity.timestamp}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
