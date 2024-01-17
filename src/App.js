import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API_ENDPOINT = "https://predict.app.landing.ai/inference/v1/predict";
const API_KEY = "land_sk_a7chYDKquvm6NrDpQklJbOKkUWnOJVBIpZUPLQpaTuE8ARb6Pn";
const ENDPOINT_ID = "dc564929-8716-4b97-8b3c-d43f938c4187";

export default function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);

  const canvasOriginalRef = useRef(null);
  const canvasPredictedRef = useRef(null);

  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];
    setImage(selectedImage);
    setResult(null);
  };

  const handlePredict = async () => {
    try {
      const formData = new FormData();
      formData.append("file", image);

      const response = await axios.post(
        `${API_ENDPOINT}?endpoint_id=${ENDPOINT_ID}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            apikey: API_KEY,
          },
        }
      );

      setResult(response.data);
    } catch (error) {
      console.error("Error predicting:", error);
    }
  };

  const drawBoundingBoxes = (context, newImage) => {
    if (result && result.backbonepredictions) {
      Object.values(result.backbonepredictions).forEach((prediction) => {
        context.strokeStyle = "red";
        context.lineWidth = 2;
        context.fillStyle = "red";
        context.font = "16px Arial";

        const { xmin, ymin, xmax, ymax } = prediction.coordinates;
        context.beginPath();
        context.rect(xmin, ymin, xmax - xmin, ymax - ymin);
        context.stroke();

        context.fillText(
          `${prediction.labelName} (${(prediction.score * 100).toFixed(2)}%)`,
          xmin,
          ymin - 5
        );
      });
    }
  };

  useEffect(() => {
    if (image && result) {
      const newImage = new Image();
      newImage.src = URL.createObjectURL(image);

      newImage.onload = () => {
        const contextOriginal = canvasOriginalRef.current.getContext("2d");
        contextOriginal.clearRect(0, 0, newImage.width, newImage.height);
        canvasOriginalRef.current.width = newImage.width;
        canvasOriginalRef.current.height = newImage.height;
        contextOriginal.drawImage(newImage, 0, 0);

        const contextPredicted = canvasPredictedRef.current.getContext("2d");
        contextPredicted.clearRect(0, 0, newImage.width, newImage.height);
        canvasPredictedRef.current.width = newImage.width;
        canvasPredictedRef.current.height = newImage.height;
        contextPredicted.drawImage(newImage, 0, 0);
        drawBoundingBoxes(contextPredicted, newImage);
      };
    }
  }, [image, result]);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <img
        src="https://focusit.pe/img/logotipo-focusit.png"
        alt="Logo"
      />
      <hr></hr>
      <label htmlFor="fileInput" style={{ display: "block", marginBottom: "10px" }}>
        Choose an image:
      </label>
      <input
        type="file"
        id="fileInput"
        onChange={handleImageChange}
        style={{ marginBottom: "20px" }}
      />
      <br />
      <button onClick={handlePredict} style={{ padding: "10px 20px", fontSize: "16px" }}>
        Predict
      </button>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ marginRight: "20px" }}>
          <h2>Original Image</h2>
          <canvas ref={canvasOriginalRef} style={{ maxWidth: "100%" }}></canvas>
        </div>
        <div>
          <h2>Predicted Image</h2>
          <canvas ref={canvasPredictedRef} style={{ maxWidth: "100%" }}></canvas>
        </div>
      </div>
    </div>
  );
}
