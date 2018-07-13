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
    productList();
  });



  function readProducts() {
    console.log("Selecting all products...\n");
    //from mysql module package
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
      // Log all results of the SELECT statement
      console.log(res);
      console.log(res.length);
      productList();
    });
  }

  
  //need to make it more than 2 columns
  // need to separate the key from the value
     

function productList() {
    // query the database for all items being auctioned
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
      // once you have the items, prompt the user for which they'd like to bid on
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

      inquirer
        .prompt([
          {
            name: "choice",
            type: "input",
            message: "What product would you like to buy?"
          },
          {
            name: "qty",
            type: "input",
            message: "How many would you like to buy?",
            validate: function(value){if(value > 0){
              return true;
            } else { console.log("  ....Input must be a number and larger than Zero");}
          }
        
          }
        ])
        .then(function(answer) {
            console.log(answer);
          // get the information of the chosen item
          var chosenItem;
         
          for (var i = 0; i < res.length; i++) {
            var listItem = 'ID#'+res[i].item_id+' - '+res[i].product_name+' - $'+res[i].price;
            if (listItem === answer.choice) {
              chosenItem = res[i];
            }
          }
          console.log(chosenItem);
          //// determine if bid was high enough
          if (chosenItem.stock_quantity >= parseInt(answer.qty)) {
          //  // bid was high enough, so update db, let the user know, and start over
          var newQty = chosenItem.stock_quantity -= parseInt(answer.qty);
          console.log(newQty);
          var dept = chosenItem.department_name;
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
                var cost = chosenItem.price * parseInt(answer.qty);
                console.log("==========================================================");
                console.log("Order placed successfully!\nYour total cost is...$" + cost);
                console.log("==========================================================");
                salesLog(cost, dept);
                productList();
                
              }
            );
          }
          else {
            // bid wasn't high enough, so apologize and start over
            console.log("Insufficient quantity. Try again...");
            productList();
          }
          
        });
    });
  }

  function salesLog(cost, dept){
    connection.query("SELECT * FROM departments WHERE department_name = ?", [dept], function(err, res) {
      if (err) throw err;
      console.log(res[0]);

    
    
    var sales = res[0].product_sales;
    console.log(sales);
    var newSales = sales + cost;
    connection.query(
      "UPDATE departments SET ? WHERE ?",
      [
       {
        product_sales: newSales
        },
        {
         department_name: dept
        }
      ],
      function(error) {
        if (error) throw error;  
        readDepartments();
      }
  );
})
  }
  function readDepartments() {
    console.log("Selecting all departments...\n");
    
    connection.query("SELECT * FROM departments", function(err, res) {
      if (err) throw err;
      // Log all results of the SELECT statement
      console.log(res);
    });
  }

  inquirer.prompt([
    {
      name: "finalized",
      type: "confirm",
      message: "Is this the Product you wish to Buy?"
    }
  ]).then(function(answer2) {
    if(answer2.finalized === true){
   console.log(res);
    console.log(answer2);
  } else {
    productList();
  }
})