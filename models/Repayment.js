"use strict";
module.exports = (sequelize, DataTypes) => {
  const Repayment = sequelize.define(
    "Repayment",
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
      Date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      SeasonID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        is: [0 - 9],
        references: {
          model: "Season",
          key: "SeasonID"
        }
      },
      ParentID: {
        type: DataTypes.UUID,
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

  return Repayment;
};
