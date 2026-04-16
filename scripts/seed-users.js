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
    email: "vendedor1@test.com",
    password: "123456",
    role: "advisor",
    firstName: "Vendedor",
    lastName: "Uno",
  },
  {
    email: "cliente1@test.com",
    password: "123456",
    role: "client",
    firstName: "Cliente",
    lastName: "Uno",
    businessName: "Cliente Uno S.A.",
    taxId: "TAXCLIENTE1001",
    contactName: "Cliente Uno",
    assignedAdvisorEmail: "vendedor1@test.com",
    status: "activo",
  },
];

async function cleanupUsers(client) {
  const existingUsersResult = await client.query(
    `SELECT id, email FROM users WHERE role::text = ANY($1::text[])`,
    [["admin", "advisor", "client"]]
  );

  if (existingUsersResult.rows.length === 0) {
    return;
  }

  const userIds = existingUsersResult.rows.map((row) => row.id);

  const advisorIdsResult = await client.query(
    `SELECT id FROM advisors WHERE user_id = ANY($1::uuid[])`,
    [userIds]
  );
  const advisorIds = advisorIdsResult.rows.map((row) => row.id);

  const clientIdsResult = await client.query(
    `SELECT id FROM clients WHERE user_id = ANY($1::uuid[])`,
    [userIds]
  );
  const clientIds = clientIdsResult.rows.map((row) => row.id);

  await client.query("BEGIN");
  try {
    await client.query(
      `DELETE FROM commissions
       WHERE order_id IN (
         SELECT id FROM orders
         WHERE client_id = ANY($1::uuid[]) OR advisor_id = ANY($2::uuid[])
       )`,
      [clientIds, advisorIds]
    );

    await client.query(
      `DELETE FROM orders
       WHERE client_id = ANY($1::uuid[]) OR advisor_id = ANY($2::uuid[])`,
      [clientIds, advisorIds]
    );

    await client.query(
      `DELETE FROM historial_asesores
       WHERE assigned_by_user_id = ANY($1::uuid[])
         OR client_id = ANY($2::uuid[])
         OR advisor_id = ANY($3::uuid[])`,
      [userIds, clientIds, advisorIds]
    );

    await client.query(
      `DELETE FROM clients
       WHERE user_id = ANY($1::uuid[])
          OR advisor_id = ANY($2::uuid[])`,
      [userIds, advisorIds]
    );

    await client.query(
      `DELETE FROM advisors WHERE user_id = ANY($1::uuid[])`,
      [userIds]
    );

    await client.query(
      `DELETE FROM users WHERE id = ANY($1::uuid[])`,
      [userIds]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

async function seedUsers() {
  const client = await pool.connect();
  let created = 0;
  let errors = 0;

  try {
    console.log("🔐 Starting user seed process...\n");

    await cleanupUsers(client);
    console.log("🧹 Previous matching users removed.");

    for (const user of DEFAULT_USERS) {
      try {
        console.log(`👤 Creating: ${user.email}`);

        const passwordHash = await bcrypt.hash(user.password, 10);
        const email = user.email.toLowerCase();

        const createResult = await client.query(
          `INSERT INTO users (email, password_hash, role, is_active)
           VALUES ($1, $2, $3, TRUE)
           RETURNING id`,
          [email, passwordHash, user.role]
        );

        const userId = createResult.rows[0].id;
        console.log(`   ✅ Created user: ${user.role}`);
        created++;

        if (user.role === "advisor") {
          await client.query(
            `INSERT INTO advisors (user_id, first_name, last_name)
             VALUES ($1, $2, $3)`,
            [userId, user.firstName, user.lastName]
          );
          console.log(`   ✅ Created advisor profile`);
        }

        if (user.role === "client") {
          const desiredAdvisorEmail = user.assignedAdvisorEmail || "vendedor1@test.com";
          const advisorResult = await client.query(
            `SELECT a.id FROM advisors a
             INNER JOIN users u ON u.id = a.user_id
             WHERE u.email = $1
             LIMIT 1`,
            [desiredAdvisorEmail.toLowerCase()]
          );

          if (!advisorResult.rows.length) {
            throw new Error(`Advisor not found: ${desiredAdvisorEmail}`);
          }

          const advisorId = advisorResult.rows[0].id;
          await client.query(
            `INSERT INTO clients (user_id, business_name, tax_id, contact_name, advisor_id, status)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, user.businessName, user.taxId, user.contactName, advisorId, user.status]
          );
          console.log(`   ✅ Created client profile with advisor ${desiredAdvisorEmail}`);
        }
      } catch (error) {
        console.error(`   ❌ Error creating ${user.email}: ${error.message}`);
        errors++;
      }
    }

    console.log("🎉 User seed completed!");
    console.log(`📊 Created: ${created} | Errors: ${errors}\n`);
  } catch (error) {
    console.error("\n❌ User seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seedUsers();
