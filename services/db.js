const { getDbClient, getDbPool } = require("../config/connectors/db");
const { getSqids } = require("../utils/sqids");

class DBService {
  async createShortUrl(longUrl) {
    const dbClient = await getDbClient();
    try {
      // 1. Single-query Upsert: Attempt to insert longUrl.
      // If it already exists, do a "noop" update to force PostgreSQL to return the row.
      /* Here if there is an existing long_url in DB, on conflict it will update the existing row in the DB 
       using the long_url value stored in a temporary virtual table called EXCLUDED (). By doing so
        we unlock the ability to read the row's data and there by returning the existing row item
        without additional select query.
    */
      const upsertCommand = `INSERT INTO "shortURLTableSchema"."shortURLTable" (short_code, long_url)
    VALUES ('TEMP', $1)
    ON CONFLICT (long_url) 
    DO UPDATE SET long_url = EXCLUDED.long_url
    RETURNING id, short_code;`;

      const result = await dbClient.query(upsertCommand, [longUrl]);
      const row = result.rows[0];

      // 2. Check if it's an existing duplicate
      // If short_code is NOT 'TEMP', it means this URL was already processed and shortened before
      if (row.short_code && row.short_code !== "TEMP") {
        return {
          isExisting: true,
          shortCode: row.short_code,
        };
      }

      // 3. Handle brand-new URL flow
      const insertedId = parseInt(row.id, 10);
      const shortCode = getSqids().encode([insertedId]);

      const updateDBCommand = `
      UPDATE "shortURLTableSchema"."shortURLTable" 
      SET short_code = $1 
      WHERE id = $2;`;

      await dbClient.query(updateDBCommand, [shortCode, insertedId]);

      return {
        isExisting: false,
        shortCode,
      };
      // eslint-disable-next-line no-useless-catch
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  }

  async getLongURL(id) {
    const dbClient = getDbPool();
    const queryText = `SELECT "long_url" from "shortURLTableSchema"."shortURLTable" WHERE id=$1`;
    const result = await dbClient.query(queryText, [id]);

    if (result.rows.length === 0) return null;
    else return result.rows[0].long_url;
  }
}

const dbServiceInstance = new DBService();

module.exports = {
  dbServiceInstance,
};
