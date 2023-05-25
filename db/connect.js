const mysql = require('mysql2');

// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'employee_db'
});

// connect to the database
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database.');
});
