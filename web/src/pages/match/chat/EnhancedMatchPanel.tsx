// import { ChatPanel } from '@/app/collabo/chat/ChatPanel';
// import { useState } from 'react';
// import { RaceTrack } from './RaceTrack';
// import { RecentActivities } from './RecentActivities';

// // Main Demo Component
// export default function EnhancedMatchPanel() {
//   const [isMicOn, setIsMicOn] = useState(false);

//   // Sample data for RaceTrack
//   const [participants] = useState([
//     {
//       id: 'you',
//       name: 'You',
//       progress: 75,
//       status: 'typing',
//       finishPosition: null,
//     },
//     {
//       id: 'user1',
//       name: 'Sarah',
//       progress: 85,
//       status: 'thinking',
//       finishPosition: null,
//     },
//     {
//       id: 'user2',
//       name: 'Alex',
//       progress: 60,
//       status: 'idle',
//       finishPosition: null,
//     },
//     {
//       id: 'user3',
//       name: 'Miguel',
//       progress: 45,
//       status: 'idle',
//       finishPosition: null,
//     },
//   ]);

//   // Sample data for RecentActivities
//   const [activities] = useState([
//     {
//       id: 1,
//       type: 'passed',
//       message: 'Sarah passed Test Case 3',
//       timestamp: '1m ago',
//     },
//     {
//       id: 2,
//       type: 'modifying',
//       message: 'Alex is modifying checkout.js',
//       timestamp: '2m ago',
//     },
//     {
//       id: 3,
//       type: 'ran',
//       message: 'You ran Test Case 2',
//       timestamp: '3m ago',
//     },
//   ]);

//   return (
//     <div className="w-80 h-screen bg-[#171717] border-l border-gray-700 flex flex-col">
//       {/* Chat Panel - takes up about 50% of the height */}
//       <div className="flex-1 p-4 min-h-0">
//         <ChatPanel isMicOn={isMicOn} setIsMicOn={setIsMicOn} />
//       </div>

//       {/* Race Track and Recent Activities - takes up the remaining 50% */}
//       <div className="flex-1 p-4 space-y-4 overflow-y-auto">
//         <RaceTrack participants={participants} />
//         <RecentActivities activities={activities} />
//       </div>

//       <style jsx>{`
//         @keyframes fade-in {
//           from {
//             opacity: 0;
//             transform: translateY(10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .animate-fade-in {
//           animation: fade-in 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }
