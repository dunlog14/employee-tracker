const inquirer = require('inquirer');
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'employee_db'
});

function mainMenu() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'menuChoice',
      message: 'What would you like to do?',
      choices: [
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'Add Department',
        'Add Role',
        'Add Employee',
        'Update Employee Role',
        'Exit'
      ]
    }
  ]).then(answer => {
    switch (answer.menuChoice) {
      case 'View All Departments':
        viewAllDepartments();
        break;
      case 'View All Roles':
        viewAllRoles();
        break;
      case 'View All Employees':
        viewAllEmployees();
        break;
      case 'Add Department':
        addDepartment();
        break;
      case 'Add Role':
        addRole();
        break;
      case 'Add Employee':
        addEmployee();
        break;
      case 'Update Employee Role':
        updateEmployeeRole();
        break;
      case 'Exit':
        db.end();
        break;
    }
  });
}

// function to view all departments
function viewAllDepartments() {
  db.query('SELECT * FROM department', function (err, results) {
    if (err) throw err;
    console.table(results);
    mainMenu();
  });
}

// function to view all roles
function viewAllRoles() {
  const query = 'SELECT role.id, role.title, department.name AS department, role.salary FROM role LEFT JOIN department ON role.department_id = department.id';
  db.query(query, function (err, results) {
    if (err) throw err;
    console.table(results);
    mainMenu();
  });
}

// function to view all employees
function viewAllEmployees() {
  const query = 'SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id';
  db.query(query, function (err, results) {
    if (err) throw err;
    console.table(results);
    mainMenu();
  });
}

// function to add a department
function addDepartment() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of the department?'
    }
  ]).then(answer => {
    const query = 'INSERT INTO department (name) VALUES (?)';
    db.query(query, answer.name, function (err, results) {
      if (err) throw err;
      console.log(`Added ${answer.name} to the database.`);
      mainMenu();
    });
  });
}

// function to add a role
function addRole() {
  const departmentQuery = 'SELECT id, name FROM department';
  db.query(departmentQuery, function (err, results) {
    if (err) throw err;
    const departmentChoices = results.map(department => {
      return {
        name: department.name,
        value: department.id
      };
    });
    inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'What is the title of the role?'
      },
      {
        type: 'input',
        name: 'salary',
        message: 'What is the salary of the role?'
      },
      {
        type: 'list',
        name: 'department',
        message: 'Which department does the role belong to?',
        choices: departmentChoices
      }
    ]).then(answers => {
      const query = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';
      db.query(query, [answers.title, answers.salary, answers.department], function (err, results) {
        if (err) throw err;
        console.log(`Added ${answers.title} to the database.`);
        mainMenu();
      });
    });
  });
}

// function to add an employee
function addEmployee() {
  const roleQuery = 'SELECT id, title FROM role';
  const managerQuery = 'SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee';
  db.query(roleQuery, function (err, roleResults) {
    if (err) throw err;
    db.query(managerQuery, function (err, managerResults) {
      if (err) throw err;
      const roleChoices = roleResults.map(role => {
        return {
          name: role.title,
          value: role.id
        };
      });
      const managerChoices = managerResults.map(manager => {
        return {
          name: manager.name,
          value: manager.id
        };
      });
      inquirer.prompt([
        {
          type: 'input',
          name: 'firstName',
          message: "What is the employee's first name?"
        },
        {
          type: 'input',
          name: 'lastName',
          message: "What is the employee's last name?"
        },
        {
          type: 'list',
          name: 'role',
          message: "What is the employee's role?",
          choices: roleChoices
        },
        {
          type: 'list',
          name: 'manager',
          message: "Who is the employee's manager?",
          choices: [{ name: 'None', value: null }, ...managerChoices]
        }
      ]).then(answers => {
        const query = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';
        db.query(query, [answers.firstName, answers.lastName, answers.role, answers.manager], function (err, results) {
          if (err) throw err;
          console.log(`Added ${answers.firstName} ${answers.lastName} to the database.`);
          mainMenu();
        });
      });
    });
  });
}

// function to update an employee's role
function updateEmployeeRole() {
  const employeeQuery = 'SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee';
  const roleQuery = 'SELECT id, title FROM role';
  db.query(employeeQuery, function (err, employeeResults) {
    if (err) throw err;
    db.query(roleQuery, function (err, roleResults) {
      if (err) throw err;
      const employeeChoices = employeeResults.map(employee => {
        return {
          name: employee.name,
          value: employee.id
        };
      });
      const roleChoices = roleResults.map(role => {
        return {
          name: role.title,
          value: role.id
        };
      });
      inquirer.prompt([
        {
          type: 'list',
          name: 'employee',
          message: 'Which employee would you like to update?',
          choices: employeeChoices
        },
        {
          type: 'list',
          name: 'role',
          message: 'What is the employee\'s new role?',
          choices: roleChoices
        }
      ]).then(answers => {
        const query = 'UPDATE employee SET role_id = ? WHERE id = ?';
        db.query(query, [answers.role, answers.employee], function (err, results) {
          if (err) throw err;
          console.log('Employee role updated successfully.');
          mainMenu();
        });
      });
    });
  });
}

// connect to the database and start the application
db.connect(err => {
  if (err) throw err;
  console.log('Connected to the employee_db database.');
  mainMenu();
});
