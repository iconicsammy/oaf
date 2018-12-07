"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("CustomerSummaries", {
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
      Credit: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      TotalRepaid: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0
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
    return queryInterface.dropTable("CustomerSummaries");
  }
};
