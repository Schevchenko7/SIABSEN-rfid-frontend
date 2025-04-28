// Di file AppContext.js
import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  
  // Nilai yang akan dibagikan melalui context
  const contextValue = {
    selectedMajor,
    setSelectedMajor,
    selectedClass,
    setSelectedClass,
    // tambahkan state dan fungsi lain yang diperlukan
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};