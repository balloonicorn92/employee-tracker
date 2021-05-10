const mysql = require('mysql2');
const inquirer = require('inquirer')
const Table = require('easy-table');
// Connect to database
const db = mysql.createConnection({
    host: 'localhost',
    // Your MySQL username,
    user: 'root',
    // Your MySQL password
    password: 'Mysqlpass',
    database: 'team'
  },
);
db.connect( err => {
  if (err) throw err;
  console.log('You are connected to the server')
    console.log(`
    ╔╦╦╦═╦╗╔═╦═╦══╦═╗
    ║║║║╩╣╚╣═╣║║║║║╩╣
    ╚══╩═╩═╩═╩═╩╩╩╩═╝
    `)
  runApp()
})

const runApp = () => {
  inquirer
  .prompt([{
      type: 'list',
      name: 'action',
      message:'What do you want to do?',
      choices:['View all employees', 
               'View all employees by department', 
              //  'View all employees by manager',
               'View all roles',
               'Add employee',
               'Update manager',
               'Remove employee']
  }
  ])
  .then(response => {
    switch (response.action){
      case 'View all employees':
        viewAll();
      break
      case 'View all employees by department':
        viewAllDept();
      break
      // case 'View all employees by manager':
      //   viewAllMngr();
      // break
      case 'View all roles':
        viewRoles();
      break
      case 'Add employee':
        addEmployee();
      break
      case 'Update manager':
        UpdateManager();
      break
      case 'Remove employee':
        removeEmployee();
      break

      default:
        viewAll();
    }
  })
}
viewAll = () => {
  const sql = `SELECT employee.*,
  roles.role_title AS role,
  roles.salary AS salary,
  department.department_name AS department
  FROM employee
  LEFT JOIN roles ON employee.role_id = roles.id
  LEFT JOIN department ON roles.department_id = department.id`
  db.query(sql, (err, rows) => {
    if (err) throw err;
    const t = new Table
    rows.forEach( data => {
      t.cell('id', data.id)
      t.cell('First_Name', data.first_name)
      t.cell('Last_Name', data.last_name)
      t.cell('Role', data.role)
      t.cell('Department', data.department)
      t.cell('Salary', data.salary)
      t.cell('Manager', data.manager_id)
      t.newRow()
    })
    console.log("\n", t.toString())
    runApp()
  })
}
 removeEmployee = () => {
  const sql = `SELECT * FROM employee`
  db.query(sql, (err, rows) => {
    if (err) throw err;
    inquirer
    .prompt([
      {
        type: "rawlist",
        name: "removeEmp",
        message: "Select the employee who will be removed",
        choices: rows.map(emp => `${emp.first_name} ${emp.last_name}`)
      }
    ]).then(answer => {
      console.log(answer)
      const selectedEmp = rows.find(emp => `${emp.first_name} ${emp.last_name}` === answer.removeEmp);
      const sql = `DELETE FROM employee WHERE ?`
      db.query(sql,
        [{
          id: selectedEmp.id
        }],
         (err, res) => {
          if (err) throw err;
          console.log("Employee Removed\n");
          viewAll();
          runApp();
        }
      );
    });
  })
};
viewRoles = () => {
  const sql = `SELECT roles.role_title FROM roles`
  db.query(sql, (err, rows) => {
    const t = new Table
    rows.forEach( data => {
      t.cell('Roles', data.role_title)
      t.newRow()
    })
    console.log(t.toString())
    runApp()
  })
}
 addEmployee =() => {
   const sql = `SELECT * FROM roles`
  db.query(sql, (err, results) => {
    if (err) throw err;
    inquirer
    .prompt([
      {
        name: "firstName",
        type: "input",
        message: "What is the new employee's first name?"
      },
      {
        name: "lastName",
        type: "input",
        message: "What is the new employee's last name?"
      },
      {
        name: "roleId",
        type: "rawlist",
        choices: results.map(item => item.role_title),
        message: "Select a role for the employee"
      }
    ]).then((answers) => {
      //console.log(answers)
      const selectedRole = results.find(item => item.role_title === answers.roleId);
      const sql = `INSERT INTO employee SET ?`
      db.query(sql,
        {
          first_name: answers.firstName,
          last_name: answers.lastName,
          role_id: selectedRole.id
        }, function (err, res) {
          if (err) throw err;
          console.log("Added new employee named " + answers.firstName + " " + answers.lastName + "\n");
          viewAll();
          runApp();
        })
    })
  })
};
viewAllDept = () => {
  const sql = `SELECT department_name FROM department `
  db.query(sql, (err, rows) => {
    if (err) throw err
    inquirer
    .prompt([
    {
        name: "departmentId",
        type: "rawlist",
        message: "Which department would you like to view?",
        choices: rows.map(item => item.department_name)
    }
    ]).then(answer => {
      const sql = `SELECT employee.*,
      roles.role_title AS role,
      roles.salary AS salary,
      department.department_name AS department
      FROM employee
      LEFT JOIN roles ON employee.role_id = roles.id
      LEFT JOIN department ON roles.department_id = department.id
      WHERE ?`
      const selectedDept = rows.find(dept => dept.department_name === answer.departmentId);
      db.query(sql, 
      [{
        department_name: selectedDept.department_name
      }],
      (err,res) => {
        const t = new Table
        res.forEach( data => {
          t.cell('id', data.id)
          t.cell('First_Name', data.first_name)
          t.cell('Last_Name', data.last_name)
          t.cell('Role', data.role)
          t.cell('Department', data.department)
          t.cell('Salary', data.salary)
          t.cell('Manager', data.manager_id)
          t.newRow()
        })
        console.log("\n","\n", t.toString())
        runApp()
        
      })
    })
  })
}
UpdateManager = () => {
  const sql = `SELECT * FROM employee`
  db.query(sql, (err, rows) => {
    if (err) throw err
    inquirer
    .prompt([
    {
        name: "managerName",
        type: "rawlist",
        message: "Select a manager?",
        choices: rows.map(man => `${man.first_name} ${man.last_name}` )
    },
    {
        name: "employeeName",
        type: 'rawlist',
        message: "select the employee you would like to assign a manager:",
        choices: rows.map(emp => `${emp.first_name} ${emp.last_name}`)
    }
    ]).then(answer => {
      const sql = `UPDATE employee
                   SET ?
                   WHERE ?`
      const selectedEmp = rows.find(emp => `${emp.first_name} ${emp.last_name}` === answer.employeeName);
      db.query(sql, 
      [{
        manager_id: answer.managerName
      },
      {
        id: selectedEmp.id
      }],
      (err,res) => {
        if (err) throw err;

        viewAll();
        runApp();
      })
    })
  })
}
// viewAllMngr = () => {
//   const sql = `SELECT manager_id FROM employee `
//   db.query(sql, (err, rows) => {
//     if (err) throw err
//     inquirer
//     .prompt([
//     {
//         name: "manager",
//         type: "rawlist",
//         message: "Which manager would you like to view?",
//         choices: rows.map(item => item.manager_id)
//     }
//     ]).then(answer => {
//       const sql = `SELECT employee.*,
//       roles.role_title AS role,
//       roles.salary AS salary,
//       department.department_name AS department
//       FROM employee
//       LEFT JOIN roles ON employee.role_id = roles.id
//       LEFT JOIN department ON roles.department_id = department.id
//       WHERE ?`
//       const selectedMang = rows.find(mang => mang.manager_id === answer.manager);
//       db.query(sql, 
//       [{
//         manager_id: selectedMang.manager_id
//       }],
//       (err,res) => {
//         const t = new Table
//         res.forEach( data => {
//           t.cell('id', data.id)
//           t.cell('First_Name', data.first_name)
//           t.cell('Last_Name', data.last_name)
//           t.cell('Role', data.role)
//           t.cell('Department', data.department)
//           t.cell('Salary', data.salary)
//           t.cell('Manager', data.manager_id)
//           t.newRow()
//         })
//         console.log(t.toString())
//         runApp()
        
//       })
//     })
//   })
// }


