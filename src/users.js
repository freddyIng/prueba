const dbConnector=require('./connection-pool.js');
const sequelize=dbConnector.getPool();

const {DataTypes, Model}=require('sequelize');

class Users extends Model{};
Users.init({
  email: {
  	type: DataTypes.STRING
  },
  password: {
  	type: DataTypes.STRING
  }
}, {
  timestamps: false,
  sequelize,
  modelName: 'users'
});

module.exports=Users;