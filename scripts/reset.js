const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { spawn } = require("child_process");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function resetDatabase() {
  const client = await pool.connect();

  try {
    console.log("🔄 Starting database reset...\n");

    // Step 1: Disable foreign key constraints temporarily
    console.log("🔓 Disabling foreign key constraints...");
    await client.query("SET session_replication_role = 'replica';");
    console.log("   ✅ Disabled\n");

    // Step 2: Delete all data (in correct order for foreign keys)
    console.log("🗑️  Deleting all data...");
    const deleteQueries = [
      { name: "order_items", sql: "DELETE FROM order_items;" },
      { name: "orders", sql: "DELETE FROM orders;" },
      { name: "products", sql: "DELETE FROM products;" },
      { name: "commissions", sql: "DELETE FROM commissions;" },
      { name: "advisors", sql: "DELETE FROM advisors;" },
      { name: "clients", sql: "DELETE FROM clients;" },
      { name: "users", sql: "DELETE FROM users;" },
    ];

    let totalDeleted = 0;
    for (const query of deleteQueries) {
      try {
        const result = await client.query(query.sql);
        if (result.rowCount > 0) {
          console.log(`   ✅ ${query.name}: ${result.rowCount} row(s) deleted`);
          totalDeleted += result.rowCount;
        }
      } catch (error) {
        // Ignore errors if table doesn't exist or is already empty
        if (!error.message.includes("does not exist")) {
          console.log(`   ⚠️  ${query.name}: ${error.message}`);
        }
      }
    }
    console.log(`   📊 Total rows deleted: ${totalDeleted}\n`);

    // Step 3: Re-enable foreign key constraints
    console.log("🔒 Re-enabling foreign key constraints...");
    await client.query("SET session_replication_role = 'origin';");
    console.log("   ✅ Enabled\n");

    // Step 4: Run seed
    console.log("🌱 Loading fresh seed data...\n");
    const seedsDir = path.join(__dirname, "..", "backend", "src", "db", "seeds");
    const files = fs
      .readdirSync(seedsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      console.log("⚠️  No seed files found");
      return;
    }

    let totalProcessed = 0;

    for (const file of files) {
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      try {
        console.log(`📝 Loading: ${file}`);
        const result = await client.query(sql);

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

    console.log("✨ Database reset completed successfully!");
    console.log(`📊 Total rows seeded: ${totalProcessed}\n`);
  } catch (error) {
    console.error("\n❌ Reset failed:", error.message);
    console.error("\n💡 Troubleshooting:");
    console.error("   - Check DATABASE_URL in .env");
    console.error("   - Ensure database exists");
    console.error("   - Verify migrations have run: npm run db:migrate");
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();

    // After product seeds, run user seed script
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
        console.log("\n✅ Database reset and seed completed successfully!");
        resolve();
      }
    });
  });
}

resetDatabase();
