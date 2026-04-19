const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost', user: 'root', password: '1206', database: 'vitarefisio_db',
});

connection.query('SELECT id, nome, email, senha FROM usuarios', (err, rows) => {
  if (err) console.error(err);
  console.table(rows); // Isso vai mostrar uma tabela bonita no terminal
  connection.end();
  process.exit();
});