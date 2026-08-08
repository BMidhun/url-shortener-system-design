const { Pool } = require("pg");

const MAX_DB_POOL_CONNECTIONS = Number(process.env.MAX_DB_POOL_CONNECTIONS);
const IDLE_DB_TIMEOUT = Number(process.env.IDLE_DB_TIMEOUT);
const DB_CONNECTION_TIMEOUT = Number(process.env.DB_CONNECTION_TIMEOUT);

console.log(
  `DB Connection Pool Settings:`,
  MAX_DB_POOL_CONNECTIONS,
  IDLE_DB_TIMEOUT,
  DB_CONNECTION_TIMEOUT,
);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: MAX_DB_POOL_CONNECTIONS || 5, // Maximum number of connections allowed in the pool per node instance
  idleTimeoutMillis: IDLE_DB_TIMEOUT || 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: DB_CONNECTION_TIMEOUT || 2000, // Return an error if a connection takes > 2s
});

function getDbPool() {
  return pool;
}

// ✅ For multi-step writes (e.g., POST link generation)
// This forces you to check out ONE client from the pool
async function getDbClient() {
  const client = await pool.connect();
  return client;
}

/*
pool.connect() extracts a single persistent database client instance from the connection pool. 
If that single client experiences an error or drops its connection in production, 
your entire application's database service will break until you restart it.
*/

async function connectToDB() {
  try {
    // Just test the pool connection capability on startup
    const client = await pool.connect();
    client.release(); // immediately release it back to the pool
    console.log("DB connection pool verified successfully...");
  } catch (error) {
    console.error(`DB connection failed. Reason:`, error);
    throw error;
  }
}

module.exports = {
  getDbClient,
  connectToDB,
  getDbPool,
};

// Understand Pooling

/*
Think of a database connection pool like a taxi company in a busy city.Without a connection pool, your app treats database connections like buying a brand-new car every single time a user requests a short URL, driving it down the street once, and then crushing it at a scrapyard.

Creating a database connection from scratch is incredibly slow and heavy. It requires your API server to hand over security credentials, establish a network handshake, and force PostgreSQL to spin up a dedicated background worker process. If 1,000 users click a link at the same time, your database will crash trying to build 1,000 cars simultaneously.

Here is how a Connection Pool fixes that in simple terms:The Taxi Company Analogy
Instead of building and destroying connections, you set up a taxi company with a fixed fleet of 20 cars (max: 20).The Setup: When your Express app starts up, it creates 20 permanent, open connections to PostgreSQL. They sit there idling, completely ready to go. 
- A Request Arrives (Catching a Cab): A user submits a URL to be shortened. Your app says, "Hey pool, I need a connection." The pool hands over one of the idling cars.

- The Execution (The Trip): The connection drives over to PostgreSQL, runs your query, and comes back.The Release 
- (Dropping off the Passenger): Your code calls client.release(). The car isn't destroyed; it just returns to the taxi rank, waiting for the next user.

What happens under heavy traffic? What if 50 users all hit your site at the exact same millisecond?
The first 20 users instantly get a connection and their requests process immediately.The remaining 30 users are placed into a neat, organized waiting line. As soon as user #1 finishes their query (which takes less than 5 milliseconds), that connection becomes available. The pool instantly hands it to user #21.If the line stalls and someone waits longer than 2 seconds (connectionTimeoutMillis: 2000), the pool drops them out of line with an error message so your system doesn't freeze forever.

Summary

A connection pool protects your database from being overwhelmed. It keeps a small, highly efficient team of permanent connections alive, reusing them millions of times a day instead of constantly creating and destroying them

*/
