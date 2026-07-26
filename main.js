const http = require("http");
const https = require("https");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const fs = require("fs");

const { setupConnectors } = require("./config/connectors");
const { getHelmetConfig } = require("./config/helmet");
const { intializeRoutes } = require("./routes/appRoutesInit");
const { rootDir } = require("./utils/rootDir");

const app = express();

// Used to forward the IP address of the client from the load balancer (Nginx). If not used, the API will always assume the client as Load Balancer

/* if(process.env.NODE_ENV !== "secure-development") {  
     app.set("trust proxy", 1);
} */

app.use(cors());
app.use(helmet(getHelmetConfig()));
app.use(express.json());

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await setupConnectors();

    intializeRoutes(app);
    // Here we don't require nginx running to setup the app. The app itself is secured.
    if (process.env.NODE_ENV === "secure-development") {
      const httpsOptions = {
        key: fs.readFileSync(`${rootDir}/certs/localhost+2-key.pem`),
        cert: fs.readFileSync(`${rootDir}/certs/localhost+2.pem`),
      };

      const httpsServer = https.createServer(httpsOptions, app);
      httpsServer.listen(PORT, () => {
        console.log("Prod app running on port::", PORT);
      });
    }

    // Both for production and development we are running it behind a nginx server. Its at the nginx where https will be configured. API servers will remain http
    // Client --> Nginx(HTTPS) ---> API(HTTP). Advantage - offloads express app from doing encrypting/decrypting data which are CPU heavy tasks
    else {
      app.set("trust proxy", 1);
      const httpServer = http.createServer(app);
      httpServer.listen(PORT, () => {
        console.log("App running on port::", PORT);
      });
    }
  } catch (error) {
    console.error("Server failed to start", error);
    process.exit(1);
  }
}

startServer();
