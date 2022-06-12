//This code create the tables in postgresql with sequelize
require('dotenv').config();
const {Sequelize}=require('sequelize');
sequelize=new Sequelize(process.env.DB_DATABASE, process.env.DB_user, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  quoteIdentifiers: false,
  freezeTableName: true,
});

const {DataTypes, Model}=require('sequelize');
const path=require('path')
const users=require(path.join(__dirname, '/src/users.js'));
const files=require(path.join(__dirname, '/src/files.js'));

(async ()=>{
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await users.sync();
    await files.sync();
    console.log('Tablas creadas!');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally{
    await sequelize.close();
  }
})();