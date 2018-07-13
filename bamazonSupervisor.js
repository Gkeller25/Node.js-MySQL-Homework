var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');


var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "root",
    database: "bamazonDB"
  });
  
  // connect to the mysql server and sql database
  connection.connect(function(err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    //readProducts();
    menu();
    
  });

function menu(){
    
    console.log("Creating Options...\n");
  inquirer
  .prompt([
    {
      name: "choice",
      type: "list",
      choices: ['View Product Sales By Department', 'Create New Department', new inquirer.Separator()],
      message: "What would you like to do?"
    }
  ])
  .then(function(answer) {
      var action = answer.choice;
      console.log("==========================================================");
console.log(action);
console.log("==========================================================");
switch(action){
    case 'View Product Sales By Department':
    viewSales();
    break;
    case 'Create New Department':
    addDepartment();
    break;
    
}
  })}
 

  function viewSales() {
    console.log("Selecting all Departments...\n");
  connection.query('SELECT department_id AS ID, department_name AS Department, over_head_costs AS Overhead, product_sales AS Sales, product_sales -over_head_costs AS "Total Profit" FROM departments', function(err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.log("==========================================================");
departmentTable(res);
  })
  function departmentTable(res){  
    console.log("Building Table...\n");
var tableHeaders = Object.keys(res[0]);
   
   var table = new Table({
    head: tableHeaders,
    colWidths: [5, 15, 10, 8, 15]

});

   for(var j = 0; j < res.length; j++){

   table.push(
       Object.values(res[j])
   );}
   console.log(table.toString());
   console.log("==========================================================\n");
  }
  //console.log("==========================================================");
  menu();
}

//  function viewSales() {
//    connection.query("SELECT * FROM departments", function(err, res) {
//        if (err) throw err;
//        // Log all results of the SELECT statement
//        console.log(res.key);
//        var table = new Table({
//            head: ['TH 1 label', 'TH 2 label'],
//            colWidths: [100, 200]
//
//        });
//table.push(
//    ['First value', 'Second value'],
//    ['First value', 'Second value']
//);
//console.log(table.toString());
//      })
//  }

function addDepartment(){
        inquirer
        .prompt([
          {
            name: "department_name",
            type: "input",
            message: "Name of Department to be added?",
            validate: function(value){if(isNaN(value)){
                var letter = /^[A-Z]/.test(value);
                if(letter === true){
              return true;}
              else {
                  console.log(".....first letter must be Capitalized!");
              }
            } else { console.log("....Input must be a string");}
          }
          },
          {
            name:"over_head_costs",
            type: "input",
            message: "What is the Department's Overhead Cost?",
            validate: function(value){if(value > 0){
              return true;
            } else { console.log("....Input must be a number higher than Zero");}
          }
          }
    
        ])
        .then(function(result) {
    console.log(result);
    inquirer.prompt([
      {
        name: "finalized",
        type: "confirm",
        message: "Is this the Department you wish to Create?"
      }
    ]).then(function(answer) {
      if(answer.finalized === true){
        updateDepartments(result);
      } else {
        addDepartment();
      }
    })
        })
      }

      function updateDepartments(result){
        
        var departmentName = result.department_name;
        var overheadCosts = result.over_head_costs;

        connection.query(
          "INSERT INTO departments SET ?",  
           {
              department_name: departmentName,
              over_head_costs: overheadCosts       
            },
            function(err, res) {
              console.log(res.affectedRows + " department created!\n");
              menu();
            }
        );   
      }