"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Seasons", {
      SeasonID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        is: [0 - 9],
        unique: true,
        primaryKey: true
      },
      SeasonName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      StartDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      EndDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null
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
    return queryInterface.dropTable("Seasons");
  }
};
