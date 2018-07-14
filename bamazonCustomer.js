var mysql = require("mysql");
var inquirer = require("inquirer");

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

  //function will display the products that the user can choose to purchase
function productList() {
    
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
    
      inquirer
        .prompt([
          {
            name: "choice",
            type: "list",
            choices: function() {
              var choiceArray = [];
              for (var i = 0; i < res.length; i++) {
                var listItem = 'ID#'+res[i].item_id+' - '+res[i].product_name+' - $'+res[i].price;
                choiceArray.push(listItem);
              }
              choiceArray.push(new inquirer.Separator());
              return choiceArray;
            },
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
        
          },
          {
            name: "finalized",
            type: "confirm",
            message: "Is this the Product you wish to Buy?"
          }
        ])
      .then(function(answer) {
        console.log("==========================================================");
        if(answer.finalized === true)  { 
        
          var chosenItem;
          for (var i = 0; i < res.length; i++) {
            var listItem = 'ID#'+res[i].item_id+' - '+res[i].product_name+' - $'+res[i].price;
            if (listItem === answer.choice) {
              chosenItem = res[i];
            }
          }
   
          //// determine if qty is high enough
          if (chosenItem.stock_quantity >= parseInt(answer.qty)) {
            // bid was high enough, so update db, let the user know, and start over
            var newQty = chosenItem.stock_quantity -= parseInt(answer.qty);
          
            var dept = chosenItem.department_name;
            connection.query("UPDATE products SET ? WHERE ?",
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
          } else {
            // bid wasn't high enough, so apologize and start over
            console.log("Insufficient quantity. Try again...");
            productList();
          }
        } else {
          
          productList();
        }
      });

    });
  }

  //get all the current departments in the database to use info from both tables to get data to update column product sales column
  function salesLog(cost, dept){
    connection.query("SELECT * FROM departments WHERE department_name = ?", [dept], function(err, res) {
      if (err) throw err;
      var sales = res[0].product_sales;
    
      var newSales = sales + cost;
      connection.query("UPDATE departments SET ? WHERE ?",
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

      }
      );
    })
  }
  