const db = require("../config/db");
const bcrypt = require("bcryptjs");

const User = {
  createUser: async ({ username, email, password }) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const query =
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
      const result = await new Promise((resolve, reject) => {
        db.query(query, [username, email, hashedPassword], (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return reject(err);
          }
          resolve(result);
        });
      });
      console.log("result: ", result);

      return result;
    } catch (error) {
      console.error("Error creating user:", error.message);
      throw new Error("Error creating user: " + error.message);
    }
  },

  // Find user by email
  findUserByEmail: (email) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM users WHERE email = ?";
      db.query(query, [email], (err, rows) => {
        if (err) return reject(err);
        resolve(rows[0]);
      });
    });
  },
  findUserById: (userId) => {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM users WHERE id = ?", [userId], (err, result) => {
        if (err) return reject(err);
        if (result.length === 0) return resolve(null); // User not found
        resolve(result[0]); // Return the first user object
      });
    });
  },

  // Update user password
  updatePassword: (userId, newPassword) => {
    return new Promise(async (resolve, reject) => {
      try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        db.query(
          "UPDATE users SET password = ? WHERE id = ?",
          [hashedPassword, userId],
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  },

  // Save reset token for password reset
  saveResetToken: (userId, resetToken) => {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET reset_token = ? WHERE id = ?",
        [resetToken, userId],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  },

  // Find user by reset token
  findUserByResetToken: (resetToken) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE reset_token = ?",
        [resetToken],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows[0]);
        }
      );
    });
  },
};

module.exports = User;
