"use strict";
module.exports = (sequelize, DataTypes) => {
  const RepaymentUpload = sequelize.define(
    "RepaymentUpload",
    {
      CustomerID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        is: [0 - 9],
        references: {
          model: "Customer",

          // This is the column name of the referenced model. Note it auto generates an auto-incrementing column
          key: "id"
        }
      },
      SeasonId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: "Season",
          key: "SeasonID"
        }
      },
      Date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      Amount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0
      }
    },
    {}
  );

  return RepaymentUpload;
};
