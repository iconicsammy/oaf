"use strict";
module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define(
    "Customer",
    {
      CustomerID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
      },
      CustomerName: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {}
  );
  Customer.associate = function(models) {
    /*
    Feel free to delete this block. If ever customer is related to some other model as a child/foreign,
    define the related models here

    */
  };
  return Customer;
};
