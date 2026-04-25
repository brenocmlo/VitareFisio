const { Client } = require('pg');
require('dotenv').config();

async function audit() {
  const client = new Client({
    connectionString: "postgresql://postgres.rzrpfjlktcfatduhwimj:5zLSuOJAAGi3lUHd@aws-1-us-east-2.pooler.supabase.com:6543/postgres"
  });

  try {
    await client.connect();
    console.log("✅ Conectado ao banco de dados!");

    const res = await client.query('SELECT id, nome, email, tipo, clinica_id, is_autonomo FROM usuarios');
    console.log("\n--- LISTA DE USUÁRIOS NO BANCO ---");
    console.table(res.rows);

    const fisios = await client.query('SELECT id, nome, email, crefito, clinica_id FROM fisioterapeutas');
    console.log("\n--- LISTA DE FISIOTERAPEUTAS NO BANCO ---");
    console.table(fisios.rows);

    const clinicas = await client.query('SELECT id, nome_fantasia FROM clinicas');
    console.log("\n--- LISTA DE CLÍNICAS NO BANCO ---");
    console.table(clinicas.rows);

  } catch (err) {
    console.error("❌ Erro ao consultar banco:", err.message);
  } finally {
    await client.end();
  }
}

audit();
