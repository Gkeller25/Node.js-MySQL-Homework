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
    readProducts();
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
//ask quantity to buy

//these two things form the customer's order

//check to see if the customer's order quantity compares to store's quantity

//update store's quantity to reflect the remaining amount

//upon success show customer total cost of their purchase

function productList() {
    // query the database for all items being auctioned
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
      // once you have the items, prompt the user for which they'd like to bid on
      inquirer
        .prompt([
          {
            name: "choice",
            type: "list",
            choices: function() {
              var choiceArray = [];
              for (var i = 0; i < res.length; i++) {
                choiceArray.push('ID#'+res[i].item_id+' - '+res[i].product_name+' - $'+res[i].price);
              }
              return choiceArray;
            },
            message: "What product would you like to buy?"
          },
          {
            name: "qty",
            type: "input",
            message: "How many would you like to buy?"
          }
        ])
        .then(function(answer) {
            console.log(answer);
          // get the information of the chosen item
          var chosenItem;
         
          for (var i = 0; i < res.length; i++) {
            if (res[i].product_name === answer.choice) {
              chosenItem = res[i];
            }
          }
          console.log(chosenItem);
          //// determine if bid was high enough
          if (chosenItem.stock_quantity >= parseInt(answer.qty)) {
          //  // bid was high enough, so update db, let the user know, and start over
          var newQty = chosenItem.stock_quantity -= parseInt(answer.qty);
          console.log(newQty);
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
                console.log("Order placed successfully!\nYour total cost is...$" + cost);
                
                readProducts();
              }
            );
          }
          else {
            // bid wasn't high enough, so apologize and start over
            console.log("Insufficient quantity. Try again...");
            productList();
          }
          //compareQTY(answer);
        });
    });
  }

  function compareQTY(answer) {
    //connection.query('SELECT * FROM products WHERE stock_quantity = answer', function(err) {
        //if (err) throw err;
    
    //})
    connection.query({
        sql: 'SELECT * FROM products WHERE stock_quantity = ?',
        timeout: 40000, // 40s
        values: [answer.choice]
      }, function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        console.log(results);
      });
  }
  