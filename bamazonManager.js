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
    //readProducts();
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
console.log("__________________________________________________________");
console.log(action);
console.log("==========================================================");
switch(action){
    case 'View Products for Sale':
    readProducts();
    break;
    case 'View Low Inventory':
    inventoryCheck();
//needs to filter out and show only products with a qty of 5 or less
    break;
    case 'Add to Inventory':
    productList()
//display a prompt to add more of any current items in the store(order more products)
    break;
    case 'Add New Product':
    newProducts()
//allow the manager to add a completely new product
}
  })}








  function readProducts() {
    console.log("Selecting all products...\n");
    //from mysql module package
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
      // Log all results of the SELECT statement
      for(var i = 0; i < res.length; i++){
      var productFancy = {
        ID: res[i].item_id,
        Name: res[i].product_name,
        Department: res[i].department_name,
        Price: "$"+res[i].price,
        Quantity: res[i].stock_quantity
      };
      
      console.log(productFancy);
    }  
    console.log("==========================================================");
    menu();
    });
    
  }




//check store's quantity



function inventoryCheck(){
  var query = "SELECT product_name FROM products WHERE stock_quantity <= 5";
  connection.query(query, function(err, res) {
    for (var i = 0; i < res.length; i++) {
      console.log(res[i].product_name);
    }
    console.log("==========================================================");
    menu();
})
}

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
                choiceArray.push(res[i].product_name+' - '+res[i].stock_quantity);
              }
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
            //console.log(answer);
          // get the information of the chosen item
          var chosenItem;
         
          for (var i = 0; i < res.length; i++) {
            var itemQty = res[i].product_name+' - '+res[i].stock_quantity;
            if (itemQty === answer.choice) {
              chosenItem = res[i];
            }
          }
          //console.log(chosenItem);
          //// determine if bid was high enough
          if (chosenItem.stock_quantity >= parseInt(answer.qty)) {
          //  // bid was high enough, so update db, let the user know, and start over
          var newQty = chosenItem.stock_quantity += parseInt(answer.qty);
          //console.log(newQty);
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

  function newProducts(){
    inquirer
    .prompt([
      {
        name: "product_name",
        type: "input",
        message: "Name of Product to be added?",
        validate: function(value){if(isNaN(value)){
          return true;
        } else { console.log("....Input must be a string");}
      }
      },
      {
        name: "department_name",
        type: "input",
        message: "Name of Department for Product?",
        validate: function(value){if(isNaN(value)){
          return true;
        } else { console.log("....Input must be a string");}
      }
      },
      {
        name:"price",
        type: "input",
        message: "What is the Price to sell the Product at?",
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
  
  function updateProducts(result){
    var newName = result.product_name;
    var departmentName = result.department_name;
    var productPrice = result.price;
    var stockQuantity = result.stock_quantity;

    connection.query(
      "INSERT INTO products SET ?",  
       {
          product_name: newName,
          department_name: departmentName,
          price: productPrice,       
          stock_quantity: stockQuantity
        },
        function(err, res) {
          console.log(res.affectedRows + " product inserted!\n");
          menu();
        }
    );   
  }
    
    
   