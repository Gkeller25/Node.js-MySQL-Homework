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
    menu();
  });

function menu(){
    
  inquirer
  .prompt([
    {
      name: "choice",
      type: "list",
      choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', new inquirer.Separator()],
      message: "What would you like to do?"
    }
  ])
  .then(function(answer) {
      var action = answer.choice;
      console.log("==========================================================");
      console.log(action);
      console.log("==========================================================");
      switch(action){
          case 'View Products for Sale':
            readProducts();
          break;

          case 'View Low Inventory':
            inventoryCheck();
          break;

          case 'Add to Inventory':
            productList()
          break;

          case 'Add New Product':
            newProducts()
      }
  })
}

  //View all Products available and Print to Table
  function readProducts() {
    console.log("Selecting all products...\n");
    connection.query('SELECT item_id AS ID, product_name AS Product, department_name AS Department, price AS Price, stock_quantity AS Quantity FROM products ', 
    function(err, res) {
      if (err) throw err;

      var tableHeaders = Object.keys(res[0]);
   
      var table = new Table({
        head: tableHeaders,
        colWidths: [5, 15, 15, 8, 10]
      });

      for(var j = 0; j < res.length; j++){

      table.push(Object.values(res[j]));
      }
      console.log(table.toString());
     
      console.log("==========================================================");
      menu();
    });  
  }

//check store's quantity
function inventoryCheck(){
  var query = "SELECT item_id AS ID, product_name AS Product, department_name AS Department, stock_quantity AS Quantity  FROM products WHERE stock_quantity <= 5";
  connection.query(query, function(err, res) {
    var tableHeaders = Object.keys(res[0]);
    var table = new Table({
      head: tableHeaders,
      colWidths: [5, 15, 15, 10] 
    });
 
    for(var j = 0; j < res.length; j++){
      table.push(Object.values(res[j]));
      }
    console.log(table.toString());
    
    console.log("==========================================================");
    menu();
  })
}


    function productList() {
    // query the database for all items being auctioned
      connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
      //prompt the user for which product they'd like to order more quantity
        inquirer.prompt([
          {
            name: "choice",
            type: "list",
            choices: function() {
              var choiceArray = [];
              for (var i = 0; i < res.length; i++) {
                choiceArray.push("ID: " + res[i].item_id + ' - ' + res[i].product_name);
              }
              choiceArray.push(new inquirer.Separator());
              return choiceArray;
            },
            message: "What product should be ordered?"
          },
          {
            name: "qty",
            type: "input",
            message: "How much Inventory to order?",
            validate: function(value){if(value > 0){
              return true;
              } else { console.log("  ....Input must be a number and larger than Zero");}
            }
          }
        ])
        .then(function(answer) {
    
          // get the information of the chosen item
          var chosenItem;
         
          for (var i = 0; i < res.length; i++) {
            var itemQty = "ID: " + res[i].item_id + ' - ' + res[i].product_name;
            if (itemQty === answer.choice) {
              chosenItem = res[i];
            }
          }
         
          //// determine if bid was high enough
          if (chosenItem.stock_quantity >= parseInt(answer.qty)) {
          //  // bid was high enough, so update db, let the user know, and start over
          var newQty = chosenItem.stock_quantity += parseInt(answer.qty);
         
            connection.query(
              "UPDATE products SET ? WHERE ?",
              [
               {
                  stock_quantity: newQty
                },
                {
                 item_id: chosenItem.item_id
                }
              ],
              function(error) {
                if (error) throw err;
                console.log("Order placed successfully!\nYour Updated Quantity for " + chosenItem.product_name + " is..." + chosenItem.stock_quantity);
                console.log("==========================================================");
                menu();
              }
            );
            } 
          });
        });
    }

  //create new products
  function newProducts(){
    //query to get all current departments in database to use for validation
    var query = "SELECT department_name FROM departments";
    connection.query(query, function(err, res) {
      var depts = [];
      for(var i = 0; i < res.length; i++){
        depts.push(Object.values(res[i]).join());
      }
      var deptsUnique = depts.filter(function(dep, j, arr){
        return arr.indexOf(dep) === j; 
      })
      console.log(deptsUnique);
      inquirer.prompt([
      {
        name: "product_name",
        type: "input",
        message: "Name of Product to be added?",
        validate: function(value){
          if(isNaN(value)){
            var letter = /^[A-Z]/.test(value);
            if(letter === true){
              return true;
            } else {
              console.log(".....First Letter must be Capitalized!");
            }
          } else { console.log("....Input must be a string");}
        }
      },
      
      {
        name: "department_name",
        type: "list",
        message: "Name of Department for Product?",
        choices: deptsUnique,
        validate: function(value){
          if(isNaN(value)){
            if(depts.includes(value, 0)){
              console.log(value);
              return true;
            } else {
              console.log(" Department needs to be added by Supervisor");
            }
          } else { console.log("....Input must be a string");}
        }
      },
      {
        name:"price",
        type: "input",
        message: "What is the Price to sell the Product at?",
        validate: function(value){
          if(parseInt(value) > 0){
            return true;
          } else { 
            console.log("....Input must be a number higher than Zero");
          }
        }
      },
      {
        name: "stock_quantity",
        type: "input",
        message: "Quantity of Product to keep in inventory?",
        validate: function(value){
          if(value > 0){
            return true;
          } else { 
            console.log("....Quantity must be a number higher than Zero");
          }
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
        if(answer.finalized === true){
          updateProducts(result);
        } else {
          newProducts();
        }
      })
    })
    })
  }
  
  //update change into database 
  function updateProducts(result){
    var newName = result.product_name;
    var departmentName = result.department_name;
    var productPrice = result.price;
    var stockQuantity = result.stock_quantity;

    connection.query("INSERT INTO products SET ?",  
       {
          product_name: newName,
          department_name: departmentName,
          price: productPrice,       
          stock_quantity: stockQuantity
        },
        function(err, res) {
          console.log(res.affectedRows + " product added!\n");
          menu();
        }
    );   
  }
    
    
   