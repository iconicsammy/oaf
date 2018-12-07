"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    // logic for transforming into the new state
    return queryInterface.addColumn("Repayments", "ParentID", Sequelize.UUID);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Repayments", "ParentID");
  }
};
