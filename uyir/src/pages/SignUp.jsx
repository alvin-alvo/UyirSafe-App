import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FormInput } from "../components/FormInput";
import { SubmitButton } from "../components/SubmitButton";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    vehicleType: "",
    fuelType: "",
    vehicleNumber: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(""); // New state for password mismatch
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate passwords on change
    if (name === "password" || name === "confirmPassword") {
      const password = name === "password" ? value : formData.password;
      const confirmPassword = name === "confirmPassword" ? value : formData.confirmPassword;
      if (password && confirmPassword && password !== confirmPassword) {
        setPasswordError("Passwords do not match. Please re-enter.");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Final password validation before submission
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      setIsLoading(false);
      return;
    }
    
    //here
    console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);

    const payload = {
    email: formData.email,
    username: formData.username,
    password: formData.password,
  };

  console.log("Payload being sent to backend:", payload)


    try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

       if (!response.ok) {
      let errorMessage = "Failed to sign up";
      try {
        const result = await response.json();
        errorMessage = result.error || errorMessage;
      } catch (jsonError) {
        // If JSON parsing fails, use the status text or a default message
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

      setSuccessMessage("Sign-up successful!");
      console.log("Sign-up successful");
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      console.error("Submission error:", error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--secondary-color)] p-4">
      <div className="card w-full max-w-md">
        <div className="mb-7 text-center">
          <h1 className="text-4xl font-bold mt-5 text-3d">
            <span className="text-[var(--primary-color)]">Uyir</span>
            <span className="text-[var(--red-color)]">Safe</span>
          </h1>
          <h2 className="text-3xl font-semibold text-[var(--primary-color)] mt-5">
            Sign up
          </h2>
        </div>

        {errorMessage && (
          <p className="text-red-500 text-sm text-center mb-6" role="alert">
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p className="text-green-500 text-sm text-center mb-6" role="status">
            {successMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* First Name and Last Name in one row */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <FormInput
                label="First Name"
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                autoComplete="given-name"
                required
              />
            </div>
            <div className="flex-1">
              <FormInput
                label="Last Name"
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                autoComplete="family-name"
                required
              />
            </div>
          </div>

          <FormInput
            label="Email"
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
          <FormInput
            label="Username"
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
            required
          />

          {/* Password Error Message */}
          {passwordError && (
            <p className="text-red-500 text-sm text-center mb-3" role="alert">
              {passwordError}
            </p>
          )}

          {/* Password and Confirm Password in one row */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <FormInput
                label="Password"
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="flex-1">
              <FormInput
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {/* Vehicle Type and Fuel Type in one row */}
          <div className="flex space-x-4">
            <div className="flex-1 space-y-2">
              <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">
                Vehicle Type
              </label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="" disabled>
                  Select a vehicle type
                </option>
                <option value="two-wheeler">Two-Wheeler (Scooter, Motorcycle, Electric Bike)</option>
                <option value="three-wheeler">Three-Wheeler (Auto Rickshaw, E-Rickshaw)</option>
                <option value="lmv">Light Motor Vehicle (Hatchback, Sedan, SUV, Van)</option>
                <option value="hmv">Heavy Motor Vehicle (Truck, Bus, Lorry)</option>
                <option value="commercial">Commercial Vehicle (Taxi, Pickup Van, Delivery Van)</option>
                <option value="special">Special Purpose Vehicle (Tractor, Crane, Ambulance, Fire Truck)</option>
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700">
                Fuel Type
              </label>
              <select
                id="fuelType"
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="" disabled>
                  Select fuel type
                </option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="ev">EV</option>
                <option value="hybrid">Hybrid</option>
                <option value="cng">CNG</option>
              </select>
            </div>
          </div>

          <FormInput
            label="Vehicle Number"
            type="text"
            id="vehicleNumber"
            name="vehicleNumber"
            value={formData.vehicleNumber}
            onChange={handleChange}
            autoComplete="off"
            required
          />
          <SubmitButton text="Register" isLoading={isLoading} />
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-red-500 hover:underline">
            Login
          </Link>
        </p>

        <p className="mt-6 text-center text-sm text-gray-500">
          Coimbatore City | UyirSafe © 2025
        </p>
      </div>
    </main>
  );
};

export default SignUp;