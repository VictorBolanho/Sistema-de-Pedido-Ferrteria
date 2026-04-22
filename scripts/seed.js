const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { spawn } = require("child_process");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runSeeds() {
  const client = await pool.connect();

  try {
    console.log("Starting seed process...");

    const seedsDir = path.join(__dirname, "..", "backend", "src", "db", "seeds");
    const files = fs
      .readdirSync(seedsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      console.log(`No seed files found in ${seedsDir}`);
      return;
    }

    console.log(`Found ${files.length} seed file(s)`);

    for (const file of files) {
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");
      console.log(`Loading ${file}`);
      await client.query(sql);
      console.log(`Loaded ${file}`);
    }

    console.log("SQL seeds completed.");
  } catch (error) {
    console.error("Seed loading failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }

  console.log("Running user seed script...");
  await runUserSeed();
}

async function runUserSeed() {
  return new Promise((resolve, reject) => {
    const userSeedPath = path.join(__dirname, "seed-users.js");
    const child = spawn("node", [userSeedPath], {
      stdio: "inherit",
      cwd: __dirname,
    });

    child.on("error", (error) => {
      console.error("Failed to run user seed:", error);
      reject(error);
    });

    child.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`User seed failed with code ${code}`));
        return;
      }

      console.log("All seeds completed successfully.");
      resolve();
    });
  });
}

runSeeds().catch((error) => {
  console.error("Seed process failed:", error.message);
  process.exit(1);
});
