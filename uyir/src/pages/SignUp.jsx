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
  const [borderErrorFields, setBorderErrorFields] = useState({});
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear border error when user starts typing
    if (borderErrorFields[name]) {
      setBorderErrorFields((prev) => ({ ...prev, [name]: false }));
    }

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

  const validateForm = () => {
    const errors = {};
    const fields = [
      "firstName",
      "lastName",
      "email",
      "username",
      "password",
      "confirmPassword",
      "vehicleType",
      "fuelType",
      "vehicleNumber",
    ];

    fields.forEach((field) => {
      if (!formData[field].trim()) {
        errors[field] = true;
      }
    });

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setBorderErrorFields({});

    // Check for empty fields
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setErrorMessage("Please fill in all required fields");
      setBorderErrorFields(errors);
      setIsLoading(false);
      return;
    }

    // Final password validation
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      setBorderErrorFields({ password: true, confirmPassword: true });
      setIsLoading(false);
      return;
    }

    const payload = {
      email: formData.email,
      username: formData.username,
      password: formData.password,
    };

    console.log("Payload being sent to backend:", payload);

    try {
      const response = await fetch("http://localhost:6969/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage("Sign-up successful!");
        console.log("Response:", result);
        setTimeout(() => navigate("/login"), 1000);
      } else {
        // Map backend errors to user-friendly messages
        let errorMsg = "Failed to sign up";
        if (result.error) {
          if (result.error.includes("duplicate key value") && result.error.includes("uni_users_name")) {
            errorMsg = "This username is already taken";
            setBorderErrorFields((prev) => ({ ...prev, username: true }));
          } else if (result.error.includes("duplicate key value") && result.error.includes("email")) {
            errorMsg = "This email is already registered";
            setBorderErrorFields((prev) => ({ ...prev, email: true }));
          } else {
            errorMsg = result.error;
          }
        }
        throw new Error(errorMsg);
      }
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
                className={borderErrorFields.firstName ? "!border-red-500 border-2" : ""}
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
                className={borderErrorFields.lastName ? "!border-red-500 border-2" : ""}
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
            className={borderErrorFields.email ? "!border-red-500 border-2" : ""}
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
            className={borderErrorFields.username ? "!border-red-500 border-2" : ""}
          />

          {/* Password Error Message */}
          {passwordError && (
            <p className="text-red-500 text-sm text-left mb-3" role="alert">
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
                className={borderErrorFields.password ? "!border-red-500 border-2" : ""}
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
                className={borderErrorFields.confirmPassword ? "!border-red-500 border-2" : ""}
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
                className={`input-field pr-6 ${borderErrorFields.vehicleType ? "!border-red-500 border-2" : ""}`}
                required
              >
                <option value="" disabled>
                  Vehicle Type
                </option>
                <option value="two-wheeler">Two-Wheeler</option>
                <option value="three-wheeler">Three-Wheeler</option>
                <option value="lmv">Light Vehicle</option>
                <option value="hmv">Heavy Vehicle</option>
                <option value="commercial">Commercial</option>
                <option value="special">Special Purpose</option>
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
                className={`input-field pr-6 ${borderErrorFields.fuelType ? "!border-red-500 border-2" : ""}`}
                required
              >
                <option value="" disabled>
                  Fuel Type
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
            className={borderErrorFields.vehicleNumber ? "!border-red-500 border-2" : ""}
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