"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Repayments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      CustomerID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        is: [0 - 9],
        references: {
          model: "Customers",
          key: "id"
        }
      },
      SeasonID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        is: [0 - 9],
        references: {
          model: "Seasons",
          key: "SeasonID"
        }
      },
      Amount: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      Date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Repayments");
  }
};
