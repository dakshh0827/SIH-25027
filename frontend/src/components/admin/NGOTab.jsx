// import React from 'react';
// import { Eye, UserCheck } from 'lucide-react';
// // import { useNGOStore } from '../../stores/useNGOStore';
// import StatusBadge from '../UI/StatusBadge';

// const NGOsTab = () => {
//   const { ngos, verifyNGO } = useNGOStore();
//   const pendingNGOs = ngos.filter(ngo => ngo.status === 'pending-verification');

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h3 className="text-xl font-semibold text-white">Registered NGOs</h3>
//         <span className="text-slate-400">
//           {pendingNGOs.length} pending verification
//         </span>
//       </div>
      
//       <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-slate-700/50">
//               <tr>
//                 <th className="text-left p-4 text-slate-300">NGO ID</th>
//                 <th className="text-left p-4 text-slate-300">Name</th>
//                 <th className="text-left p-4 text-slate-300">Email</th>
//                 <th className="text-left p-4 text-slate-300">Status</th>
//                 <th className="text-left p-4 text-slate-300">Projects</th>
//                 <th className="text-left p-4 text-slate-300">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {ngos.map(ngo => (
//                 <tr key={ngo.id} className="border-t border-slate-700">
//                   <td className="p-4 text-blue-400 font-mono">{ngo.id}</td>
//                   <td className="p-4 text-white">{ngo.name}</td>
//                   <td className="p-4 text-slate-300">{ngo.email}</td>
//                   <td className="p-4">
//                     <StatusBadge status={ngo.status} />
//                   </td>
//                   <td className="p-4 text-slate-300">{ngo.projects}</td>
//                   <td className="p-4">
//                     <div className="flex gap-2">
//                       <button className="p-2 text-blue-400 hover:bg-blue-400/10 rounded">
//                         <Eye className="h-4 w-4" />
//                       </button>
//                       {ngo.status === 'pending-verification' && (
//                         <button 
//                           onClick={() => verifyNGO(ngo.id)}
//                           className="p-2 text-green-400 hover:bg-green-400/10 rounded"
//                         >
//                           <UserCheck className="h-4 w-4" />
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NGOsTab;