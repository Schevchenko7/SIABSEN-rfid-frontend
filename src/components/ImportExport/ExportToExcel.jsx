import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Button from '../UI/Button'; // Adjust the import path as necessary

const ExportToExcel = ({ data, filename: defaultFilename = 'export', buttonText = 'Export to Excel' }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filename, setFilename] = useState(defaultFilename);
  const [selectAll, setSelectAll] = useState(false);

  // Initialize selected rows when preview is opened
  const handleOpenPreview = () => {
    setSelectedRows(data.map((_, index) => index));
    setSelectAll(true);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map((_, index) => index));
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (index) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter(i => i !== index));
      setSelectAll(false);
    } else {
      setSelectedRows([...selectedRows, index]);
      if (selectedRows.length + 1 === data.length) {
        setSelectAll(true);
      }
    }
  };

  const exportToExcel = () => {
    const selectedData = selectedRows.map(index => data[index]);
    const worksheet = XLSX.utils.json_to_sheet(selectedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    handleClosePreview();
  };

  // Get column headers from the first data item
  const getHeaders = () => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  };

  return (
    <>
      <Button 
        variant="success" 
        onClick={handleOpenPreview}
        className="flex items-center"
      >
        <svg 
          className="w-5 h-5 mr-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        {buttonText}
      </Button>

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-4xl max-h-screen overflow-auto">
            <h2 className="text-xl font-bold mb-4">Preview Data for Export</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filename:
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>

            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="mr-2"
                />
                <span className="font-medium">Select All Rows</span>
              </div>
              
              <div className="border rounded overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select
                      </th>
                      {getHeaders().map((header, idx) => (
                        <th 
                          key={idx} 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(rowIndex)}
                            onChange={() => handleRowSelect(rowIndex)}
                          />
                        </td>
                        {getHeaders().map((header, idx) => (
                          <td 
                            key={idx} 
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {String(row[header])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button 
                variant="secondary" 
                onClick={handleClosePreview}
              >
                Cancel
              </Button>
              <Button 
                variant="success" 
                onClick={exportToExcel}
                disabled={selectedRows.length === 0}
              >
                Export {selectedRows.length} {selectedRows.length === 1 ? 'Row' : 'Rows'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportToExcel;