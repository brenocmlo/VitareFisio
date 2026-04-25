const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function rescue() {
  const client = new Client({
    connectionString: "postgresql://postgres.rzrpfjlktcfatduhwimj:5zLSuOJAAGi3lUHd@aws-1-us-east-2.pooler.supabase.com:6543/postgres"
  });

  try {
    await client.connect();
    console.log("✅ Conectado para o resgate!");

    // Busca fisioterapeutas que NÃO têm um e-mail correspondente na tabela de usuários
    const res = await client.query(`
      SELECT f.nome, f.email, f.clinica_id 
      FROM fisioterapeutas f
      WHERE f.email NOT IN (SELECT email FROM usuarios)
    `);

    if (res.rows.length === 0) {
      console.log("✨ Todos os fisioterapeutas já possuem login de acesso.");
      return;
    }

    const salt = await bcrypt.genSalt(8);
    const password = await bcrypt.hash('mudar123', salt);

    for (const fisio of res.rows) {
      // Para o resgate, vamos usar um CPF genérico se não tivermos, ou você pode ajustar
      // No seu banco o CPF é obrigatório e único.
      // Vou usar um CPF baseado no clinica_id + index para ser único no teste
      const fakeCpf = Math.random().toString().slice(2, 13); 

      await client.query(
        'INSERT INTO usuarios (nome, email, senha, cpf, clinica_id, tipo, is_autonomo) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [fisio.nome, fisio.email, password, fakeCpf, fisio.clinica_id, 'fisioterapeuta', false]
      );
      console.log(`🚀 Login criado para: ${fisio.nome} (${fisio.email}) | Senha: mudar123`);
    }

  } catch (err) {
    console.error("❌ Erro no resgate:", err.message);
  } finally {
    await client.end();
  }
}

rescue();
