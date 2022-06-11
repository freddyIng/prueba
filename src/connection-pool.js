require('dotenv').config();
const {Sequelize}=require('sequelize');
var sequelize;

module.exports={
  getPool: function(){
    if (sequelize) return sequelize;
    sequelize=new Sequelize(process.env.DB_DATABASE, process.env.DB_user, process.env.DB_PASSWORD,{
      host: process.env.DB_HOST,
      dialect: 'postgres',
      quoteIdentifiers: false,
      freezeTableName: true,
      logging: false,
      pool: {
        max: 100,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
    return sequelize;
  }  
};
