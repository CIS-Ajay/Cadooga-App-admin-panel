// server/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool to the MySQL database
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cadooga',
  port: process.env.DB_PORT || 3306, 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database');
    await connection.ping(); // Ping the database to ensure it's responsive
    // connection.release();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Execute a query with parameters
async function query(sql, params = []) {
  try {
    // Fix for LIMIT and OFFSET parameters in prepared statements
    if (sql.includes('LIMIT ?') || sql.includes('OFFSET ?')) {
      // MySQL doesn't handle LIMIT and OFFSET parameters well in prepared statements
      // Replace the placeholders with the actual values
      const limitRegex = /LIMIT\s+\?/i;
      const offsetRegex = /OFFSET\s+\?/i;
      
      let modifiedSql = sql;
      let modifiedParams = [...params]; // Clone params
      
      if (limitRegex.test(sql)) {
        // Find the position of the LIMIT parameter in the params array
        const paramIndex = (sql.substring(0, sql.search(limitRegex)).match(/\?/g) || []).length;
        const limitValue = parseInt(params[paramIndex]);
        
        if (!isNaN(limitValue)) {
          modifiedSql = modifiedSql.replace(limitRegex, `LIMIT ${limitValue}`);
          // Remove the limit value from params
          modifiedParams.splice(paramIndex, 1);
        }
      }
      
      if (offsetRegex.test(modifiedSql)) {
        // Find the position of the OFFSET parameter in the modified params array
        const paramIndex = (modifiedSql.substring(0, modifiedSql.search(offsetRegex)).match(/\?/g) || []).length;
        const offsetValue = parseInt(modifiedParams[paramIndex]);
        
        if (!isNaN(offsetValue)) {
          modifiedSql = modifiedSql.replace(offsetRegex, `OFFSET ${offsetValue}`);
          // Remove the offset value from params
          modifiedParams.splice(paramIndex, 1);
        }
      }
      
      // Execute with modified SQL and params
      const [results] = await pool.execute(modifiedSql, modifiedParams);
      return results;
    } else {
      // For normal queries without LIMIT/OFFSET placeholders
      const [results] = await pool.execute(sql, params);
      return results;
    }
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

module.exports = {
  pool,
  query,
  testConnection
};