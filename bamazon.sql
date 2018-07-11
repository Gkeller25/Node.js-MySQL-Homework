DROP DATABASE IF EXISTS bamazonDB;

CREATE database bamazonDB;

USE bamazonDB;

CREATE TABLE products (
 item_id INT NOT NULL AUTO_INCREMENT,
 product_name VARCHAR(50) NOT NULL,
 department_name VARCHAR(30) NOT NULL,
 price INT NOT NULL,
 stock_quantity INT NOT NULL,
 PRIMARY KEY (item_id)
);


INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Necklace", 'Jewelry', 100, 20);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Pants", 'Clothing', 50, 75);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Sneakers", 'Footwear', 39, 40);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Ring", 'Jewelry', 150, 35);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Tee-Shirt", 'Clothing', 15, 75);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("TV", 'Electronics', 450, 15);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Laptop", 'Electronics', 350, 10);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Camera", 'Electronics', 125, 30);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Book", 'Literature', 14.99, 55);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Socks", 'Clothing', 5, 60);


USE bamazonDB;

CREATE TABLE departments (
 department_id INT NOT NULL AUTO_INCREMENT,
 department_name VARCHAR(30) NOT NULL,
 over_head_costs INT NOT NULL,
 PRIMARY KEY (department_id)
);


ALTER TABLE departments
ADD product_sales INT NULL;