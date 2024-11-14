const Product = require("../models/Product");
const { validationResult } = require("express-validator");
const ExcelJS = require("exceljs");

exports.createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { product_name, product_image, product_price } = req.body;
  try {
    const productId = await Product.create({
      product_name,
      product_image,
      product_price,
    });
    res.status(201).json({ msg: "Product created successfully", productId });
  } catch (err) {
    console.error("Error creating product:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getProductById = async (req, res) => {
  const product_id = req.params.id;
  console.log("Product_Id: ", product_id);

  try {
    const product = await Product.findById(product_id);
    console.log("product:", product);

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    console.error("Error fetching product by ID:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.updateProduct = async (req, res) => {
  const product_id = req.params.id;
  const { product_name, product_image, product_price } = req.body;

  try {
    const updatedRows = await Product.update(product_id, {
      product_name,
      product_image,
      product_price,
    });
    if (updatedRows === 0) {
      return res
        .status(404)
        .json({ msg: "Product not found or no changes made" });
    }
    res.status(200).json({ msg: "Product updated successfully" });
  } catch (err) {
    console.error("Error updating product:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  const product_id = req.params.id;
  try {
    const deletedRows = await Product.delete(product_id);
    if (deletedRows === 0) {
      return res.status(404).json({ msg: "Product not found" });
    }
    res.status(200).json({ msg: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// Search Products by name or ID
exports.searchProducts = async (req, res) => {
  const { product_name, product_id } = req.query;

  try {
    let products;
    if (product_name) {
      products = await Product.searchByName(product_name);
    } else if (product_id) {
      products = await Product.findById(product_id);
      products = products ? [products] : [];
    } else {
      return res
        .status(400)
        .json({ msg: "Please provide product_name or product_id" });
    }
    res.status(200).json(products);
  } catch (err) {
    console.error("Error searching products:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// Download Selected Product Details in Excel
exports.downloadProductsExcel = async (req, res) => {
  const { productIds, columns } = req.body; // Expecting product IDs and columns in request body
  console.log("productIds:", productIds, "   ", "columns:", columns);

  try {
    const products = await Product.findMultipleByIds(productIds);
    console.log("Fetched products:", products);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Products");

    // Add headers to the worksheet
    worksheet.columns = columns.map((col) => ({ header: col, key: col }));

    // Add product data to the worksheet
    products.forEach((product) => {
      const row = {};
      columns.forEach((col) => {
        row[col] = product[col];
      });
      worksheet.addRow(row);
    });

    // Set the response headers for download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=products.xlsx");

    // Write to response
    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (err) {
    console.error("Error downloading products in Excel:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};
 
exports.Name = async (req, res) => {
  const product_name = req.query.name; // Extract the product_name from query parameters
  console.log("product-name", product_name);

  if (!product_name) {
    return res
      .status(400)
      .json({ msg: "Please provide a product name to search." });
  }

  try {
    const products = await Product.findMultipleProductsByName(product_name);
    console.log("findMultipleProductsByName", products);

    if (products.length === 0) {
      return res
        .status(404)
        .json({ msg: "No products found with the specified name." });
    }
    res.status(200).json(products);
  } catch (err) {
    console.error("Error searching products by name:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};




