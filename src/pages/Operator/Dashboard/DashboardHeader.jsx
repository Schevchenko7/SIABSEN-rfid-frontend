import React from 'react';

const DashboardHeader = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
      </div>
    </div>
  );
};

export default DashboardHeader;