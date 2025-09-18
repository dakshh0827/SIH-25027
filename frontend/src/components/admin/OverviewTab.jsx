// import React from 'react';
// import { Database, Clock, Users, Coins } from 'lucide-react';
// import { useProjectStore } from '../../stores/useProjectStore';
// import { useNGOStore } from '../../stores/useNGOStore';
// import StatsCard from '../UI/StatsCard';

// const OverviewTab = () => {
//   const { projects } = useProjectStore();
//   const { ngos } = useNGOStore();

//   const pendingVerifications = projects.filter(p => p.status === 'pending-verification');
//   const totalCredits = projects.reduce((sum, p) => sum + p.carbonCredits, 0);

//   return (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <StatsCard 
//           label="Total Projects"
//           value={projects.length}
//           icon={Database}
//           color="text-blue-400"
//         />
//         <StatsCard 
//           label="Pending Verification"
//           value={pendingVerifications.length}
//           icon={Clock}
//           color="text-orange-400"
//         />
//         <StatsCard 
//           label="Registered NGOs"
//           value={ngos.length}
//           icon={Users}
//           color="text-green-400"
//         />
//         <StatsCard 
//           label="Total Credits"
//           value={totalCredits}
//           icon={Coins}
//           color="text-yellow-400"
//         />
//       </div>

//       {/* Recent Activity */}
//       <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
//         <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
//         <div className="space-y-3">
//           {projects.slice(0, 5).map(project => (
//             <div key={project.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
//               <div className="flex items-center gap-3">
//                 <div className={`w-2 h-2 rounded-full ${
//                   project.status === 'verified' ? 'bg-green-400' :
//                   project.status === 'in-progress' ? 'bg-yellow-400' : 'bg-orange-400'
//                 }`}></div>
//                 <div>
//                   <p className="text-white font-medium">{project.title}</p>
//                   <p className="text-slate-400 text-sm">by {project.ngo}</p>
//                 </div>
//               </div>
//               <div className="text-sm text-slate-400">
//                 Updated {project.lastUpdate}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OverviewTab;