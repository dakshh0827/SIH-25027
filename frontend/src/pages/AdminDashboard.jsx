// import React, { useState } from 'react';
// import {
//   Shield,
//   Settings,
//   BarChart3,
//   TreePine,
//   Users,
//   AlertCircle
// } from 'lucide-react';
// import OverviewTab from '../components/admin/OverviewTab';
// import ProjectsTab from '../components/admin/ProjectsTab';
// import NGOsTab from '../components/admin/NGOTab';

// const AdminDashboard = () => {
//   const [activeTab, setActiveTab] = useState('overview');

//   const tabs = [
//     { id: 'overview', label: 'Overview', icon: BarChart3 },
//     { id: 'projects', label: 'Projects', icon: TreePine },
//     { id: 'ngos', label: 'NGOs', icon: Users },
//     { id: 'verification', label: 'Verification', icon: Shield }
//   ];

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case 'overview':
//         return <OverviewTab />;
//       case 'projects':
//         return <ProjectsTab />;
//       case 'ngos':
//         return <NGOsTab />;
//       case 'verification':
//         return (
//           <div className="text-center py-12">
//             <AlertCircle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
//             <p className="text-slate-400">Verification panel coming soon</p>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-900">
//       <div className="border-b border-slate-700">
//         <div className="max-w-7xl mx-auto px-4">
//           <div className="flex items-center justify-between py-4">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-blue-600 rounded-lg">
//                 <Shield className="h-6 w-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-white">NCCR Admin Panel</h1>
//                 <p className="text-slate-400 text-sm">Blockchain Registry Management</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30">
//                 <div className="w-2 h-2 bg-green-400 rounded-full"></div>
//                 <span className="text-sm">Blockchain Connected</span>
//               </div>
//               <Settings className="h-6 w-6 text-slate-400 cursor-pointer hover:text-white" />
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="max-w-7xl mx-auto px-4 py-6">
//         <div className="flex gap-6">
//           {/* Sidebar */}
//           <div className="w-64 flex-shrink-0">
//             <nav className="space-y-1">
//               {tabs.map(tab => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
//                     activeTab === tab.id
//                       ? 'bg-blue-600 text-white'
//                       : 'text-slate-400 hover:text-white hover:bg-slate-800'
//                   }`}
//                 >
//                   <tab.icon className="h-5 w-5" />
//                   {tab.label}
//                 </button>
//               ))}
//             </nav>
//           </div>
//           {/* Main Content */}
//           <div className="flex-1">
//             {renderTabContent()}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;