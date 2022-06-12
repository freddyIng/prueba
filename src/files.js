const dbConnector=require('./connection-pool.js');
const sequelize=dbConnector.getPool();

const {DataTypes, Model}=require('sequelize');

class Files extends Model{};
Files.init({
  userId: {
    type: DataTypes.INTEGER
  },
  key: {
    type: DataTypes.STRING
  },
  location: {
    type: DataTypes.STRING
  }
}, {
  timestamps: false,
  sequelize,
  modelName: 'files'
});

module.exports=Files;