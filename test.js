`use strict`;

// Dependencies
const inquirer = require(`inquirer`);
const cTable = require(`console.table`);
const Mysql = require('sync-mysql')

// Queries
const sqlViewDepartments = `select * from department`;
const sqlViewrRoles = `
select role.id, role.title, role.salary, department.name as department 
from role 
left join department on role.department_id = department.id
`;
const sqlViewEmployees = `
select employee.id, employee.first_name, employee.last_name, role.title, 
department.name, role.salary,concat(manager.first_name,' ', manager.last_name) as manager
from employee
left join role on employee.role_id = role.id
left join department on role.department_id = department.id
left join employee as manager on employee.manager_id = manager.id;
`;


const connection = new Mysql({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '***********',
    database: 'homework_11'
});

const mainMenu = async() => {
    const { input } = await inquirer.prompt({
        message: `What would you like to do?`,
        name: `input`,
        type: `list`,
        choices: [
            `View Departments`,
            `View Roles`,
            `View Employees`,
            `Add Department`,
            `Add Role`,
            `Add Employee`,
            `Update Employee Role`,
            `Exit Program`
        ]
    })
    return input;
};

const selectDepartment = async(prompt) => {
    const table = connection.query(`select * from department`);
    const { input } = await inquirer.prompt({
        message: prompt,
        name: `input`,
        type: `list`,
        choices: table.map(x => x.name)
    });
    return table.filter(x => x.name === input)[0].id;

};

const selectRole = async(prompt) => {
    const table = connection.query(`select * from role`);
    const { input } = await inquirer.prompt({
        message: prompt,
        name: `input`,
        type: `list`,
        choices: table.map(x => x.title)
    });
    return table.filter(x => x.title === input)[0].id;
};

const selectEmployee = async(prompt) => {
    const table = connection.query(`select * from employee`);
    const { input } = await inquirer.prompt({
        message: prompt,
        name: `input`,
        type: `list`,
        choices: [`none`, ...table.map(x => `${x.first_name} ${x.last_name}`)]
    });
    if (input === `none`) return null;
    else return table.filter(x => `${x.first_name} ${x.last_name}` === input)[0].id;
};


const addDepartment = async() => {
    const { input } = await inquirer.prompt({
        message: `Enter name of new department`,
        name: `input`,
    });
    connection.query(`insert into department(name) values('${input}')`)
    console.log(`Created new department ${input}.`);
};

const addRole = async() => {
    const { title } = await inquirer.prompt({
        message: `Enter name of new role.`,
        name: `title`
    });
    const { salary } = await inquirer.prompt({
        message: `Enter annual salary for new role.`,
        name: `salary`
    });
    const departmentID = await selectDepartment(`Add role to which department?`);
    connection.query(`insert into role(title, salary, department_id) 
        values('${title}', ${salary}, ${departmentID})`);
};

const addEmployee = async() => {
    const { firstName } = await inquirer.prompt({
        message: `Enter first name.`,
        name: `firstName`
    });
    const { lastName } = await inquirer.prompt({
        message: `Enter last name.`,
        name: `lastName`
    });
    const roleID = await selectRole(`What is the employee's role?`);
    const managerID = await selectEmployee(`Whos is the employee's manager?`)
    connection.query(`insert into employee(first_name, last_name, role_id, manager_id)
        values('${firstName}', '${lastName}', ${roleID}, ${managerID})`);
};

const updateRole = async() => {
    const employeeID = await selectEmployee(`Select employee to update.`);
    const roleID = await selectRole(`Select a role.`);
    connection.query(`update employee set role_id = ${roleID} where id = ${employeeID}`);
};

(async() => {
    let exitFlag = false;
    while (!exitFlag) {
        const input = await mainMenu();
        switch (input) {
            case `View Departments`:
                console.table(connection.query(sqlViewDepartments));
                break;
            case `View Roles`:
                console.table(connection.query(sqlViewrRoles));
                break;
            case `View Employees`:
                console.table(connection.query(sqlViewEmployees));
                break;
            case `Add Department`:
                await addDepartment();
                console.log(`Department added to database.`);
                break;
            case `Add Role`:
                await addRole();
                console.log(`Role added to database.`);
                break;
            case `Add Employee`:
                await addEmployee();
                console.log(`Employee added to database.`)
                break;
            case `Update Employee Role`:
                await updateRole();
                console.log(`Employee role updated.`);
                break;
            case `Exit Program`:
                exitFlag = true;
                break;
        }
    }
})();