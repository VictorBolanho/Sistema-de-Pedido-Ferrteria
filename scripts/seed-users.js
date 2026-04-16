const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const DEFAULT_USERS = [
  {
    email: "admin@test.com",
    password: "123456",
    role: "admin",
    firstName: "Admin",
    lastName: "User",
  },
  {
    email: "advisor@test.com",
    password: "123456",
    role: "advisor",
    firstName: "Juan",
    lastName: "Advisor",
  },
  {
    email: "client@test.com",
    password: "123456",
    role: "client",
    firstName: "Carlos",
    lastName: "Client",
  },
];

async function seedUsers() {
  const client = await pool.connect();
  let created = 0;
  let updated = 0;
  let errors = 0;

  try {
    console.log("🔐 Starting user seed process...\n");

    for (const user of DEFAULT_USERS) {
      try {
        console.log(`👤 Processing: ${user.email}`);

        // Hash password
        const passwordHash = await bcrypt.hash(user.password, 10);
        const email = user.email.toLowerCase();

        // Check if user exists
        const existingResult = await client.query(
          "SELECT id FROM users WHERE email = $1",
          [email]
        );

        if (existingResult.rows.length > 0) {
          // User exists - update password
          const userId = existingResult.rows[0].id;
          await client.query(
            "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
            [passwordHash, userId]
          );
          console.log(`   ✅ Updated: password refreshed\n`);
          updated++;
        } else {
          // User doesn't exist - create user
          const createResult = await client.query(
            `INSERT INTO users (email, password_hash, role, is_active)
             VALUES ($1, $2, $3, TRUE)
             RETURNING id`,
            [email, passwordHash, user.role]
          );

          const userId = createResult.rows[0].id;
          console.log(`   ✅ Created: ${user.role} user\n`);
          created++;

          // Create profile if applicable (advisor or client)
          if (user.role === "advisor") {
            try {
              await client.query(
                `INSERT INTO advisors (user_id, first_name, last_name)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (user_id) DO UPDATE SET
                   first_name = EXCLUDED.first_name,
                   last_name = EXCLUDED.last_name,
                   updated_at = NOW()`,
                [userId, user.firstName, user.lastName]
              );
              console.log(`   ✅ Advisor profile created\n`);
            } catch (error) {
              console.log(`   ⚠️  Advisor profile: ${error.message}\n`);
            }
          } else if (user.role === "client") {
            try {
              // First, find or create a default advisor
              const advisorResult = await client.query(
                `SELECT id FROM advisors LIMIT 1`
              );

              let advisorId;
              if (advisorResult.rows.length > 0) {
                advisorId = advisorResult.rows[0].id;
              } else {
                // Create a default advisor if none exists
                const defaultAdvisorResult = await client.query(
                  `SELECT id FROM users WHERE email = $1`,
                  ["advisor@test.com"]
                );

                if (defaultAdvisorResult.rows.length > 0) {
                  const advisorUserId = defaultAdvisorResult.rows[0].id;
                  const advisorCreateResult = await client.query(
                    `INSERT INTO advisors (user_id, first_name, last_name)
                     VALUES ($1, 'Juan', 'Advisor')
                     ON CONFLICT (user_id) DO NOTHING
                     RETURNING id`,
                    [advisorUserId]
                  );

                  if (advisorCreateResult.rows.length > 0) {
                    advisorId = advisorCreateResult.rows[0].id;
                  } else {
                    // Get existing advisor for this user
                    const existingAdvisor = await client.query(
                      `SELECT id FROM advisors WHERE user_id = $1`,
                      [advisorUserId]
                    );
                    advisorId = existingAdvisor.rows[0].id;
                  }
                }
              }

              if (advisorId) {
                await client.query(
                  `INSERT INTO clients (user_id, business_name, tax_id, contact_name, advisor_id)
                   VALUES ($1, $2, $3, $4, $5)
                   ON CONFLICT (user_id) DO UPDATE SET
                     business_name = EXCLUDED.business_name,
                     contact_name = EXCLUDED.contact_name,
                     updated_at = NOW()`,
                  [userId, "Test Business", "TAX123456789", user.firstName, advisorId]
                );
                console.log(`   ✅ Client profile created\n`);
              } else {
                console.log(`   ⚠️  Client profile: No advisor available\n`);
              }
            } catch (error) {
              console.log(`   ⚠️  Client profile: ${error.message}\n`);
            }
          }
        }
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
        errors++;
      }
    }

    console.log("🎉 User seed completed!");
    console.log(`📊 Created: ${created} | Updated: ${updated} | Errors: ${errors}\n`);
  } catch (error) {
    console.error("\n❌ User seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seedUsers();
