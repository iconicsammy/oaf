"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "Customers",
      [
        {
          CustomerID: 1,
          CustomerName: "Fred Barasa"
        },
        {
          CustomerID: 2,
          CustomerName: "Imelda Kundu"
        },
        {
          CustomerID: 3,
          CustomerName: "Leah Kundu"
        },
        {
          CustomerID: 4,
          CustomerName: "Beatrice Wafula Machuma"
        },
        {
          CustomerID: 5,
          CustomerName: "John Juma Shitoshe"
        },
        {
          CustomerID: 7,
          CustomerName: "Donald Masika"
        },
        {
          CustomerID: 8,
          CustomerName: "Bilasio Masinde"
        },
        {
          CustomerID: 9,
          CustomerName: "Peter Masinde"
        },
        {
          CustomerID: 10,
          CustomerName: "Francis S. Misiko"
        },
        {
          CustomerID: 11,
          CustomerName: "Peter Wechuli Nakitare"
        },
        {
          CustomerID: 12,
          CustomerName: "Mwanaisha Nekesa"
        },
        {
          CustomerID: 13,
          CustomerName: "John Nyongesa"
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    return queryInterface.bulkDelete("Customers", null, {});
  }
};
