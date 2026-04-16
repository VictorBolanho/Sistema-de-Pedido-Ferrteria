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
  let totalProcessed = 0;

  try {
    console.log("🌱 Starting seed process...\n");

    const seedsDir = path.join(__dirname, "..", "backend", "src", "db", "seeds");
    const files = fs
      .readdirSync(seedsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      console.log("⚠️  No seed files found in", seedsDir);
      return;
    }

    console.log(`📁 Found ${files.length} seed file(s)\n`);

    for (const file of files) {
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      try {
        console.log(`📝 Loading: ${file}`);
        const result = await client.query(sql);

        // Log result details
        if (result.rowCount !== undefined) {
          totalProcessed += result.rowCount;
          console.log(`   ✅ Processed: ${result.rowCount} row(s)\n`);
        } else {
          console.log(`   ✅ Executed successfully\n`);
        }
      } catch (error) {
        console.error(`   ❌ Error in ${file}:`, error.message);
        throw error;
      }
    }

    console.log("📦 SQL seeds completed!\n");
  } catch (error) {
    console.error("\n❌ Seed loading failed:", error.message);
    console.error("\n💡 Troubleshooting:");
    console.error("   - Check DATABASE_URL in .env");
    console.error("   - Ensure database exists");
    console.error("   - Verify migrations have run: npm run db:migrate");
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();

    // After SQL seeds, run user seed script
    console.log("🔐 Running user seed script...\n");
    await runUserSeed();
  }
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
        console.error(`User seed exited with code ${code}`);
        reject(new Error(`User seed failed with code ${code}`));
      } else {
        console.log("\n✅ All seeds completed successfully!");
        resolve();
      }
    });
  });
