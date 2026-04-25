const { Client } = require('pg');

async function fix() {
  const client = new Client({
    connectionString: "postgresql://postgres.rzrpfjlktcfatduhwimj:5zLSuOJAAGi3lUHd@aws-1-us-east-2.pooler.supabase.com:6543/postgres"
  });

  try {
    await client.connect();
    console.log("✅ Conectado!");

    // Corrige o clinica_id do seu usuário principal
    await client.query('UPDATE usuarios SET clinica_id = 2 WHERE id = 1');
    console.log("🚀 Usuário Breno Camelo (ID 1) agora está vinculado à Clínica ID 2!");

    // Garante que ele seja ADMIN para ter todas as permissões
    await client.query("UPDATE usuarios SET tipo = 'admin' WHERE id = 1");
    console.log("👑 Usuário Breno Camelo agora é ADMIN.");

  } catch (err) {
    console.error("❌ Erro na correção:", err.message);
  } finally {
    await client.end();
  }
}

fix();
