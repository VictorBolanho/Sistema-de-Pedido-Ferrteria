const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const DEFAULT_PASSWORD = "admin123";

const DEFAULT_USERS = [
  {
    email: "admin@test.com",
    password: DEFAULT_PASSWORD,
    role: "admin",
  },
  {
    email: "vendedor1@test.com",
    password: DEFAULT_PASSWORD,
    role: "advisor",
    firstName: "Carlos",
    lastName: "Lopez",
  },
  {
    email: "vendedor2@test.com",
    password: DEFAULT_PASSWORD,
    role: "advisor",
    firstName: "Laura",
    lastName: "Moreno",
  },
  {
    email: "cliente1@test.com",
    password: DEFAULT_PASSWORD,
    role: "client",
    businessName: "Ferreteria Central SAS",
    taxId: "TAXCLIENTE1001",
    contactName: "Cliente Uno",
    phone: "3000001001",
    assignedAdvisorEmail: "vendedor1@test.com",
    status: "activo",
  },
  {
    email: "cliente2@test.com",
    password: DEFAULT_PASSWORD,
    role: "client",
    businessName: "Materiales del Norte SAS",
    taxId: "TAXCLIENTE1002",
    contactName: "Cliente Dos",
    phone: "3000001002",
    assignedAdvisorEmail: "vendedor2@test.com",
    status: "activo",
  },
  {
    email: "cliente-pendiente@test.com",
    password: DEFAULT_PASSWORD,
    role: "client",
    businessName: "Ferreteria Pendiente SAS",
    taxId: "TAXCLIENTE1003",
    contactName: "Cliente Pendiente",
    phone: "3000001003",
    assignedAdvisorEmail: "vendedor1@test.com",
    status: "pendiente",
  },
];

async function cleanupUsers(client) {
  const existingUsersResult = await client.query(
    `SELECT id FROM users WHERE role::text = ANY($1::text[])`,
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
      `DELETE FROM clients WHERE user_id = ANY($1::uuid[])`,
      [userIds]
    );

    await client.query(
      `DELETE FROM advisors WHERE user_id = ANY($1::uuid[])`,
      [userIds]
    );

    await client.query(
      `DELETE FROM access_requests WHERE email = ANY($1::text[])`,
      [DEFAULT_USERS.map((user) => user.email.toLowerCase())]
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

  try {
    console.log("Starting user seed process...");
    await cleanupUsers(client);
    console.log("Previous admin, advisor and client users removed.");

    const advisorMap = new Map();

    for (const user of DEFAULT_USERS.filter((item) => item.role !== "client")) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      const createResult = await client.query(
        `INSERT INTO users (email, password_hash, role, is_active)
         VALUES ($1, $2, $3, TRUE)
         RETURNING id, email`,
        [user.email.toLowerCase(), passwordHash, user.role]
      );

      const userId = createResult.rows[0].id;
      console.log(`Created ${user.role}: ${user.email}`);

      if (user.role === "advisor") {
        const advisorResult = await client.query(
          `INSERT INTO advisors (user_id, first_name, last_name)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [userId, user.firstName, user.lastName]
        );
        advisorMap.set(user.email.toLowerCase(), advisorResult.rows[0].id);
      }
    }

    for (const user of DEFAULT_USERS.filter((item) => item.role === "client")) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      const isPortalEnabled = user.status === "activo";
      const createdUser = await client.query(
        `INSERT INTO users (email, password_hash, role, is_active)
         VALUES ($1, $2, 'client', $3)
         RETURNING id`,
        [user.email.toLowerCase(), passwordHash, isPortalEnabled]
      );

      const advisorId = advisorMap.get(user.assignedAdvisorEmail.toLowerCase());
      if (!advisorId) {
        throw new Error(`Advisor not found for client seed: ${user.assignedAdvisorEmail}`);
      }

      const createdClient = await client.query(
        `INSERT INTO clients (user_id, business_name, tax_id, contact_name, phone, advisor_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          createdUser.rows[0].id,
          user.businessName,
          user.taxId,
          user.contactName,
          user.phone,
          advisorId,
          user.status,
        ]
      );

      await client.query(
        `INSERT INTO historial_asesores (client_id, advisor_id, reason)
         VALUES ($1, $2, $3)`,
        [createdClient.rows[0].id, advisorId, "Seed inicial"]
      );

      console.log(`Created client: ${user.email} (${user.status})`);
    }

    console.log("User seed completed successfully.");
  } catch (error) {
    console.error("User seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seedUsers();
