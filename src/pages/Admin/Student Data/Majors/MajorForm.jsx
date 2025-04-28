import React, { useState, useEffect } from 'react';
import Button from '../../../../components/UI/Button';

const MajorForm = ({ major, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    majorName: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (major) {
      setFormData({
        majorName: major.major_name || ''
      });
    } else {
      setFormData({
        majorName: ''
      });
    }
  }, [major]);

  const validate = () => {
    const newErrors = {};
    if (!formData.majorName.trim()) {
      newErrors.majorName = 'Major name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        id: major?.id,
        major_name: formData.majorName
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="majorName" className="block text-sm font-medium text-gray-700 mb-1">
          Major Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="majorName"
          name="majorName"
          value={formData.majorName}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.majorName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
          }`}
        />
        {errors.majorName && (
          <p className="mt-1 text-sm text-red-600">{errors.majorName}</p>
        )}
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="secondary" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button 
          variant={major ? "warning" : "success"} 
          type="submit"
        >
          {major ? 'Update' : 'Create'} Major
        </Button>
      </div>
    </form>
  );
};

export default MajorForm;