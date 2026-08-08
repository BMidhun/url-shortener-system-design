const https = require("https");

// 1. Create an array of functions that RETURN a Promise when executed
const exampleComSitesArrayRequests = Array.from({ length: 500 }, (_, i) => {
  const data = JSON.stringify({ longUrl: `https://example.com/${i + 1}` });
  return () => makeHttpsRequest(data);
});

function makeHttpsRequest(data) {
  // Return a new Promise so the loop can 'await' it
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      path: "/api/v1/shorten", // Update to your corrected server endpoint
      method: "POST",
      rejectUnauthorized: false,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve(parsedData); // Resolving tells the loop it can move to the next item
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", (error) => {
      reject(error); // Rejecting stops the loop if an error happens
    });

    req.write(data);
    req.end();
  });
}

async function createShortURLs() {
  try {
    // A standard for...of loop works perfectly here once the functions return Promises
    for (let makeRequest of exampleComSitesArrayRequests) {
      console.log("Starting a request...");
      const result = await makeRequest(); // Execution pauses here until resolve() is called
      console.log("Finished request. Success:", result);
    }
  } catch (error) {
    console.error("Batch halted due to error:", error);
  }
}

createShortURLs();
