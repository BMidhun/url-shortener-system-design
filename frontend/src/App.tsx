import { useState } from "react";
import "./App.css";

const BASE_API_URL = import.meta.env.REACT_APP_BASE_API_URL || "";

function App() {
  const [inputUrl, setInputUrl] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setShortenedUrl("");

    if (!inputUrl.trim()) {
      setError("Please enter a URL.");
      return;
    }

    if (!validateUrl(inputUrl)) {
      setError("Please enter a valid URL (e.g., https://example.com).");
      return;
    }

    setIsLoading(true);

    try {
      // Replace with your actual URL shortener API endpoint and payload structure
      const response = await fetch(`${BASE_API_URL}/api/v1/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ longUrl: inputUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to shorten the URL. Please try again.");
      }

      const data = await response.json();
      setShortenedUrl(data.data.shortCode);
    } catch (err) {
      console.log(err);
      setError("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="shortener-container">
      <h2>URL Shortener</h2>
      <form onSubmit={handleSubmit} className="shortener-form">
        <input
          type="text"
          placeholder="Paste your long link here..."
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          className={`shortener-input ${error ? "input-error" : ""}`}
        />
        <button type="submit" disabled={isLoading} className="shortener-button">
          {isLoading ? "Shortening..." : "Shorten"}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {shortenedUrl && (
        <div className="result-container">
          <p>Your shortened URL:</p>
          <a
            href={`${BASE_API_URL}/${shortenedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shortened-link"
          >
            {`${BASE_API_URL || window.location.protocol + "//" + window.location.host}/${shortenedUrl}`}
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
