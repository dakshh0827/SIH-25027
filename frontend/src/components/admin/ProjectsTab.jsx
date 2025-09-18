// import React from 'react';
// import { Plus, Eye, CheckCircle, AlertCircle } from 'lucide-react';
// import { useProjectStore } from '../../stores/useProjectStore';
// import StatusBadge from '../UI/StatusBadge';

// const ProjectsTab = () => {
//   const { projects, verifyProject, rejectProject } = useProjectStore();

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h3 className="text-xl font-semibold text-white">All Projects</h3>
//         <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
//           <Plus className="h-4 w-4 inline mr-2" />
//           Add Project
//         </button>
//       </div>
      
//       <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-slate-700/50">
//               <tr>
//                 <th className="text-left p-4 text-slate-300">Project ID</th>
//                 <th className="text-left p-4 text-slate-300">Title</th>
//                 <th className="text-left p-4 text-slate-300">NGO</th>
//                 <th className="text-left p-4 text-slate-300">Status</th>
//                 <th className="text-left p-4 text-slate-300">Credits</th>
//                 <th className="text-left p-4 text-slate-300">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {projects.map(project => (
//                 <tr key={project.id} className="border-t border-slate-700">
//                   <td className="p-4 text-blue-400 font-mono">{project.id}</td>
//                   <td className="p-4 text-white">{project.title}</td>
//                   <td className="p-4 text-slate-300">{project.ngo}</td>
//                   <td className="p-4">
//                     <StatusBadge status={project.status} />
//                   </td>
//                   <td className="p-4 text-green-400 font-medium">{project.carbonCredits}</td>
//                   <td className="p-4">
//                     <div className="flex gap-2">
//                       <button className="p-2 text-blue-400 hover:bg-blue-400/10 rounded">
//                         <Eye className="h-4 w-4" />
//                       </button>
//                       {project.status === 'pending-verification' && (
//                         <>
//                           <button 
//                             onClick={() => verifyProject(project.id)}
//                             className="p-2 text-green-400 hover:bg-green-400/10 rounded"
//                           >
//                             <CheckCircle className="h-4 w-4" />
//                           </button>
//                           <button 
//                             onClick={() => rejectProject(project.id, 'Needs more documentation')}
//                             className="p-2 text-red-400 hover:bg-red-400/10 rounded"
//                           >
//                             <AlertCircle className="h-4 w-4" />
//                           </button>
//                         </>
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

// export default ProjectsTab;