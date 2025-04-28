import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-indigo-600 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-sm">
            &copy; {currentYear} SI-Absen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;