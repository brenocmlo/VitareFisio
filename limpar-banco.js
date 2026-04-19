const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1206',
  database: 'vitarefisio_db',
});

console.log('--- 🧹 FAXINA FINAL DE INTEGRIDADE ---');

// Tabelas que dependem de Pacientes/Fisioterapeutas devem ser limpas primeiro
const tabelas = [
  'agendamentos', 
  'evolucoes', 
  'pagamentos', 
  'pacientes', 
  'fisioterapeutas', 
  'usuarios'
];

function limparProxima(index) {
  if (index >= tabelas.length) {
    console.log('\n✅ Banco de dados limpo e consistente!');
    connection.end();
    process.exit();
    return;
  }

  const tabela = tabelas[index];
  // Usamos TRUNCATE ou DELETE sem WHERE para zerar a tabela e remover órfãos
  const sql = `DELETE FROM ${tabela}`;

  connection.query(sql, function (err, results) {
    if (err) {
      // Ignora erro caso a tabela ainda não exista
      console.log(`- Tabela [${tabela}]: Pulada ou ainda não criada.`);
    } else {
      console.log(`- Tabela [${tabela}]: Zerada com sucesso.`);
    }
    limparProxima(index + 1);
  });
}

// Desativa verificação de chaves estrangeiras temporariamente para conseguir limpar tudo
connection.query('SET FOREIGN_KEY_CHECKS = 0', () => {
  limparProxima(0);
});