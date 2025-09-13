import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  let badgeClasses = '';
  let icon = null;

  switch (status) {
    case 'verified':
      badgeClasses = 'bg-green-500/20 text-green-400 border border-green-500/30';
      icon = <CheckCircle className="inline h-3 w-3 mr-1" />;
      break;
    case 'in-progress':
      badgeClasses = 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      icon = <Clock className="inline h-3 w-3 mr-1" />;
      break;
    case 'pending-verification':
    case 'under-review':
      badgeClasses = 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      icon = <AlertCircle className="inline h-3 w-3 mr-1" />;
      break;
    default:
      badgeClasses = 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
      break;
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClasses}`}>
      {icon}
      {status.replace('-', ' ')}
    </span>
  );
};

export default StatusBadge;