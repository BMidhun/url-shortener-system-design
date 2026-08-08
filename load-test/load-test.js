/* 
k6 does not run directly inside a Node.js engine; it is written in Go and uses a custom JavaScript runtime. 
Because of this architectural choice, k6 cannot use standard ES module JSON imports
*/
import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data"; // 👈 Required for loading shared data memory-efficiently

// 1. Load and parse the JSON file inside the k6 Init context
const data = new SharedArray("sample data", function () {
  // ignore the error as open is not defined - because you might be running this file using Node.js (node script.js) instead of the k6 CLI
  return JSON.parse(open("./sample-data.json")); // 👈 Uses open() instead of import
});

export const options = {
  vus: 50, // 50 Virtual Users
  duration: "30s",
  insecureSkipTLSVerify: true,
};

// 2. The main iteration function must be exported as default, not as main()
export default function () {
  const actionChance = Math.random() * 100;
  const baseUrl = "https://localhost"; // Added standard local development port example

  if (actionChance <= 10) {
    // 10% Chance: POST request to create a new short URL
    const payload = JSON.stringify({
      longUrl: `https://example.com/${Math.floor(Math.random() * 1000)}`,
    });

    const params = {
      headers: { "Content-Type": "application/json" },
    };

    const res = http.post(`${baseUrl}/api/v1/shorten`, payload, params);

    check(res, {
      "POST status is 201": (r) => r.status === 201 || r.status === 200,
    });
  } else {
    // 90% Chance: GET request to redirect a short URL
    const randomIndex = Math.floor(Math.random() * data.length); // Dynamic bounds checking
    const randomShortCode = data[randomIndex]?.short_code;

    const params = { redirects: 0 };
    const res = http.get(`${baseUrl}/${randomShortCode}`, params);

    check(res, {
      "GET status is 301 or 302 or 404": (r) =>
        r.status === 301 || r.status === 302 || r.status === 404,
    });
  }
  sleep(0.1);
}
