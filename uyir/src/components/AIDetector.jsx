import React, { useState } from "react";
import axios from "axios";

const AIDetector = () => {
    const [image, setImage] = useState(null);
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!image) return alert("Please upload an image!");

        const formData = new FormData();
        formData.append("image", image);

        try {
            const res = await axios.post("http://localhost:6969/api/ai/detect", formData);
            setResult(res.data);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div>
            <h1>UyirSafe Hazard Detector 🚦</h1>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Analyze</button>

            {result && (
                <div>
                    <h2>Result:</h2>
                    <p>Hazard Type: {result.hazardType}</p>
                    <p>Confidence: {(result.confidence * 100).toFixed(2)}%</p>
                    {result.status && <p>Status: {result.status}</p>}
                    {result.department && <p>Department: {result.department}</p>}
                    {result.action && <p>Action: {result.action}</p>}
                </div>
            )}
        </div>
    );
};

export default AIDetector;
