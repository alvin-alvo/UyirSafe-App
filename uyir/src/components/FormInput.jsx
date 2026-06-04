import React from "react";
import styles from "./FormInput.module.css";

export const FormInput = ({
  label,
  type,
  id,
  name,
  value,
  onChange,
  required = true,
  autoComplete,
  className,
}) => {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[var(--text-color)]"
      >
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        placeholder={label}
        className={`input-field ${className || ""}`}
        aria-required={required}
      />
    </div>
  );
};