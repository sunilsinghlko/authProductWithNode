const db = require("../config/db");

const Product = {
  // Create a new product
  create: async ({ product_name, product_image, product_price }) => {
    try {
      const query =
        "INSERT INTO products (product_name, product_image, product_price) VALUES (?, ?, ?)";
      const result = await new Promise((resolve, reject) => {
        db.query(
          query,
          [product_name, product_image, product_price],
          (err, result) => {
            if (err) {
              console.error("Database error:", err);
              return reject(err);
            }
            resolve(result);
            console.log("after resolving promise:", result);
          }
        );
      });
      console.log("Product created with ID:", result.insertId);
      return result.insertId; // Return the ID of the created product
    } catch (error) {
      console.error("Error creating product:", error.message);
      throw new Error("Error creating product: " + error.message);
    }
  },

  // Get all products
  findAll: () => {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM products";
      db.query(query, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  // Get a product by ID
  findById: (product_id) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM products WHERE product_id = ?";
      db.query(query, [product_id], (err, rows) => {
        if (err) {
          console.error("Error in findById:", err);
          return reject(err);
        }
        if (rows.length === 0) return resolve(null); // If no product found, return null
        resolve(rows[0]); // Return the first product from the result set
      });
    });
  },

  // Update a product by ID
  update: (product_id, { product_name, product_image, product_price }) => {
    return new Promise((resolve, reject) => {
      const query =
        "UPDATE products SET product_name = ?, product_image = ?, product_price = ? WHERE product_id = ?";
      db.query(
        query,
        [product_name, product_image, product_price, product_id],
        (err, result) => {
          if (err) return reject(err);
          resolve(result.affectedRows);
        }
      );
    });
  },

  // Delete a product by ID
  delete: (product_id) => {
    return new Promise((resolve, reject) => {
      const query = "DELETE FROM products WHERE product_id = ?";
      db.query(query, [product_id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows);
      });
    });
  },

  searchByName: (product_name) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM products WHERE product_name LIKE ?";
      db.query(query, [`%${product_name}%`], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  findMultipleProductsByName: (productName) => {
    console.log("productName in findMultipleProductsByName", productName);
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM products WHERE product_name LIKE ?";
      db.query(query, [`%${productName}%`], (err, rows) => {
        if (err) {
          console.error("Error in findMultipleProductsByName:", err);
          return reject(err);
        }
        resolve(rows || []); // Return matched products or an empty array if no matches
      });
    });
  },

  // Find multiple products by a list of IDs
  findMultipleByIds: (productIds) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM products WHERE product_id IN (?)";
      db.query(query, [productIds], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },
  
};

module.exports = Product;
