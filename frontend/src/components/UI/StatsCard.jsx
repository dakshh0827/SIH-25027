import React from 'react';

const StatsCard = ({ label, value, icon: Icon, color }) => {
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        {Icon && <Icon className={`h-8 w-8 ${color}`} />}
      </div>
    </div>
  );
};

export default StatsCard;