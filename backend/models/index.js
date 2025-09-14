'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  // For production with PostgreSQL
  const pg = require('pg');
  sequelize = new Sequelize(process.env[config.use_env_variable], {
    ...config,
    dialect: 'postgres',
    protocol: 'postgres',
    dialectModule: pg,
    dialectOptions: config.dialectOptions || {}
  });
} else {
  // For development with SQLite
  sequelize = new Sequelize({
    ...config,
    storage: config.storage,
    dialect: 'sqlite',
    logging: false
  });
}

// Import models
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Associate models
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
