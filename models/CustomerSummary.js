"use strict";
module.exports = (sequelize, DataTypes) => {
  const CustomerSummary = sequelize.define(
    "CustomerSummary",
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
        allowNull: false,
        is: [0 - 9],
        references: {
          model: "Season",
          key: "SeasonID"
        }
      },
      Credit: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      TotalRepaid: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0
      }
    },
    {}
  );

  return CustomerSummary;
};
