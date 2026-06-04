import React, { useEffect, useState } from 'react';

const vehicleOptions = ['Two-Wheeler', 'Three-Wheeler', 'Light Vehicle', 'Heavy Vehicle', 'Commercial', 'Special Purpose'];
const fuelOptions = ['Petrol', 'Diesel', 'EV', 'Hybrid', 'CNG'];

const PersonalDetails = ({ username }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(null); // null until data is fetched
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from backend (simulate here)
  useEffect(() => {
    // Replace this with actual fetch later
    const fetchData = async () => {
      // Simulated API response
      const res = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@example.com',
        username: username,
        dob: '2003-05-14',
        phone: '+91-9876543210',
        address: 'Ernakulam, Kerala',
        vehicleType: 'Light Vehicle',
        fuelType: 'Petrol',
        vehicleNumber: 'KL-07-AB-1234',
      };
      setForm(res);
      setIsLoading(false);
    };

    fetchData();
  }, [username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    setIsEditing(false);
    console.log('Sending updated data to backend:', form);

    // Example POST request
    // await fetch('/api/update-profile', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(form),
    // });
  };

  if (isLoading || !form) return <div className="text-gray-600">Loading personal details...</div>;

  return (
    <div className="col-span-2 card glass rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Personal Details</h3>
        {!isEditing ? (
          <button onClick={handleEdit} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Edit</button>
        ) : (
          <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">Save</button>
        )}
      </div>

      <ul className="text-gray-700 space-y-2">
        {/* Text Fields */}
        {['firstName', 'lastName', 'email', 'username', 'phone', 'vehicleNumber', 'address'].map((field) => (
          <li key={field}>
            <strong className="capitalize">{field.replace(/([A-Z])/g, ' $1')}:</strong>{' '}
            {isEditing ? (
              <input
                type={field === 'email' ? 'email' : 'text'}
                name={field}
                value={form[field]}
                onChange={handleChange}
                className="ml-2 border border-gray-300 px-2 py-1 rounded text-sm w-64"
              />
            ) : (
              <span className="ml-2">{form[field]}</span>
            )}
          </li>
        ))}

        {/* DOB Field */}
        <li>
          <strong>DOB:</strong>{' '}
          {isEditing ? (
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className="ml-2 border border-gray-300 px-2 py-1 rounded text-sm"
            />
          ) : (
            <span className="ml-2">{form.dob}</span>
          )}
        </li>

        {/* Dropdown: Vehicle Type */}
        <li>
          <strong>Vehicle Type:</strong>{' '}
          {isEditing ? (
            <select
              name="vehicleType"
              value={form.vehicleType}
              onChange={handleChange}
              className="ml-2 border border-gray-300 px-2 py-1 rounded text-sm"
            >
              {vehicleOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <span className="ml-2">{form.vehicleType}</span>
          )}
        </li>

        {/* Dropdown: Fuel Type */}
        <li>
          <strong>Fuel Type:</strong>{' '}
          {isEditing ? (
            <select
              name="fuelType"
              value={form.fuelType}
              onChange={handleChange}
              className="ml-2 border border-gray-300 px-2 py-1 rounded text-sm"
            >
              {fuelOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <span className="ml-2">{form.fuelType}</span>
          )}
        </li>
      </ul>
    </div>
  );
};

export default PersonalDetails;
