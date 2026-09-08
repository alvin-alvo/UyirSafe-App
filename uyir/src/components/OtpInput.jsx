import React, { useState, useRef, useEffect } from 'react';

export const OtpInput = ({ length = 6, onComplete, isError, isSuccess }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto-focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value !== "" && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    // Trigger complete
    if (newOtp.every(val => val !== "")) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        inputRefs.current[index - 1].focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length).split("");
    if (pastedData.some(char => isNaN(char))) return;

    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      if (i < length) newOtp[i] = char;
    });
    setOtp(newOtp);

    // Focus appropriate input after paste
    const focusIndex = Math.min(pastedData.length, length - 1);
    if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex].focus();
    }

    if (newOtp.every(val => val !== "")) {
      onComplete(newOtp.join(""));
    }
  };

  const getStateStyles = () => {
    if (isError) return "border-red-500 bg-red-50 text-red-700 animate-[shake_0.4s_ease-in-out]";
    if (isSuccess) return "border-green-500 bg-green-50 text-green-700 shadow-[0_0_15px_rgba(34,197,94,0.3)]";
    return "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200";
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          maxLength={1}
          ref={ref => inputRefs.current[index] = ref}
          value={data}
          onChange={e => handleChange(e.target, index)}
          onKeyDown={e => handleKeyDown(e, index)}
          className={`w-12 h-14 text-center text-xl font-semibold rounded-xl border-2 transition-all duration-200 outline-none ${getStateStyles()}`}
        />
      ))}
    </div>
  );
};
