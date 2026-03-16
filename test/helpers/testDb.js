require("dotenv").config({ path: "../../.env.test" });

const pool = require("../../src/config/db");
const fs = require("fs");
const path = require("path");

const runSqlFile = async (filePath) => {
  const sql = fs.readFileSync(filePath, "utf8");
  await pool.query(sql);
};

const setupTestDb = () => {
  // Assume schema is already run manually on test DB
  // beforeAll(async () => {
  //   await runSqlFile(path.join(__dirname, "../../db/schema.sql"));
  // });

  beforeEach(async () => {
    // Truncate tables to ensure clean state
    await pool.query(`
      TRUNCATE TABLE expense_shares, expenses, group_members, groups, users RESTART IDENTITY CASCADE;
    `);
    await pool.query("BEGIN");
  });

  afterEach(async () => {
    await pool.query("ROLLBACK");
  });

  afterAll(async () => {
    await pool.end();
  });
};

module.exports = { setupTestDb };
