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
console.log("__________________________________________________________");
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
  connection.query("SELECT *, product_sales -over_head_costs AS total_profit FROM departments ", function(err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.log(res);
   
  })
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
              return true;
            } else { console.log("....Input must be a string");}
          }
          },
          {
            name:"price",
            type: "input",
            message: "What is the Department's Overhead Cost?",
            validate: function(value){if(value > 0){
              return true;
            } else { console.log("....Input must be a number higher than Zero");}
          }
          },
          {
            name: "stock_quantity",
            type: "input",
            message: "How much of the Product to have in Inventory?",
            validate: function(value){if(value > 0){
              return true;
            } else { console.log("....Quantity must be a number higher than Zero");}
          }
          }
    
        ])
        .then(function(result) {
    console.log(result);
    inquirer.prompt([
      {
        name: "finalized",
        type: "confirm",
        message: "Is this the Product you wish to Add?"
      }
    ]).then(function(answer) {
      console.log(answer.finalized);
      if(answer.finalized === true){
        updateProducts(result);
        console.log("working");
      } else {
        newProducts();
      }
    })
        })
      }
