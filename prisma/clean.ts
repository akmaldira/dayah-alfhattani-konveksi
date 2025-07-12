import { PrismaClient } from "@/lib/prisma/generated";
import path from "path";

const prisma = new PrismaClient();

function sqlEscape(value: any): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number" || typeof value === "boolean")
    return value.toString();
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function main() {
  const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE';
  `;

  const uncleanTables = ["user", "verification_token", "session"];
  const tableNames: string[] = tables
    .map((t) => t.table_name)
    .filter((t) => !uncleanTables.includes(t));

  console.log(`Cleaning ${tableNames.length} tables...`);

  let sqlDump = "-- Data-only SQL dump\n\n";
  for (const tableName of tableNames) {
    const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${tableName}
      ORDER BY ordinal_position;
    `;
    const columnNames = columns.map((c) => `"${c.column_name}"`);
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "${tableName}"`
    );

    for (const row of rows) {
      const values = columnNames.map((col) => {
        const key = col.replace(/"/g, "");
        return sqlEscape(row[key]);
      });
      sqlDump += `INSERT INTO "${tableName}" (${columnNames.join(
        ", "
      )}) VALUES (${values.join(", ")});\n`;
    }

    sqlDump += "\n";
  }

  const fileName = `data_backup_${
    new Date().toISOString().split("T")[0]
  }_${Date.now()}.sql`;
  const filePath = path.join(__dirname, fileName);
  await Bun.write(filePath, sqlDump);
  console.log(`✅ Dumped to ${fileName}`);

  await prisma.$executeRawUnsafe(`SET session_replication_role = 'replica';`);

  for (const table of tableNames) {
    console.log(`Deleting rows from: ${table}`);
    await prisma.$executeRawUnsafe(`DELETE FROM "${table}";`);
  }

  await prisma.$executeRawUnsafe(`SET session_replication_role = 'origin';`);

  console.log("✅ Cleaned database");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
