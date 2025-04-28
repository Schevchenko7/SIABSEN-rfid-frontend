import React, { useState, useEffect } from 'react';
import Button from '../../../../components/UI/Button';
import { getMajors } from '../../../../services/Admin/majorsService'; // Import the necessary service

const ClassForm = ({ classItem, majorName = "PPLG", onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    id: '',
    class_name: '',
    school_major_id: ''
  });

  const [errors, setErrors] = useState({});
  const [majors, setMajors] = useState([]);
  const [isLoadingMajors, setIsLoadingMajors] = useState(false);

  // Fetch majors when component mounts
  useEffect(() => {
    const fetchMajors = async () => {
      setIsLoadingMajors(true);
      try {
        const data = await getMajors();
        setMajors(data);
      } catch (err) {
        console.error('Error fetching majors:', err);
      } finally {
        setIsLoadingMajors(false);
      }
    };

    fetchMajors();
  }, []);

  useEffect(() => {
    if (classItem) {
      setFormData({
        id: classItem.id || '',
        class_name: classItem.class_name || '',
        school_major_id: classItem.school_major_id || ''
      });
    } else {
      // For new class, try to set a default major
      const defaultMajorId = majors.length > 0 ? 
        (majors.find(m => m.major_name === majorName)?.id || majors[0].id) : 
        '';
        
      setFormData({
        id: '',
        class_name: '',
        school_major_id: defaultMajorId
      });
    }
  }, [classItem, majors, majorName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.class_name.trim()) {
      newErrors.class_name = 'Class name is required';
    }
    
    if (!formData.school_major_id) {
      newErrors.school_major_id = 'Major is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Generate class name suggestions based on selected major name
  const generateClassOptions = () => {
    const grades = ['10', '11', '12'];
    const sections = ['1', '2', '3'];
    const options = [];
    
    // Get the name of the currently selected major
    const selectedMajorName = formData.school_major_id ? 
      (majors.find(m => m.id.toString() === formData.school_major_id.toString())?.major_name || majorName) : 
      majorName;
    
    grades.forEach(grade => {
      sections.forEach(section => {
        options.push(`${grade} ${selectedMajorName} ${section}`);
      });
    });
    
    return options;
  };

  const suggestions = generateClassOptions();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="school_major_id">
          Major <span className="text-red-500">*</span>
        </label>
        <select
          id="school_major_id"
          name="school_major_id"
          value={formData.school_major_id}
          onChange={handleChange}
          disabled={isLoadingMajors}
          className={`w-full px-3 py-2 border ${
            errors.school_major_id ? 'border-red-500' : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            isLoadingMajors ? 'bg-gray-100' : ''
          }`}
        >
          <option value="">Select a major</option>
          {majors.map(major => (
            <option key={major.id} value={major.id}>
              {major.major_name}
            </option>
          ))}
        </select>
        {errors.school_major_id && (
          <p className="mt-1 text-sm text-red-600">{errors.school_major_id}</p>
        )}
        {isLoadingMajors && (
          <p className="mt-1 text-sm text-gray-500">Loading majors...</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="class_name">
          Class Name <span className="text-red-500">*</span>
        </label>
        <input
          className={`w-full px-3 py-2 border ${
            errors.class_name ? 'border-red-500' : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          id="class_name"
          type="text"
          name="class_name"
          value={formData.class_name}
          onChange={handleChange}
          placeholder="Enter class name (e.g. 10 PPLG 1)"
        />
        {errors.class_name && (
          <p className="mt-1 text-sm text-red-600">{errors.class_name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Suggestions
        </label>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm transition-colors"
              onClick={() => setFormData({ ...formData, class_name: suggestion })}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 flex items-center justify-end space-x-3 border-t mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {classItem ? 'Update Class' : 'Create Class'}
        </Button>
      </div>
    </form>
  );
};

export default ClassForm;