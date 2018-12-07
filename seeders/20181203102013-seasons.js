"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "Seasons",
      [
        {
          SeasonID: 110,
          SeasonName: "2012, Short Rain",
          StartDate: "8/1/2012",
          EndDate: null
        },
        {
          SeasonID: 120,
          SeasonName: "2013, Long Rain",
          StartDate: "3/1/2013",
          EndDate: null
        },
        {
          SeasonID: 130,
          SeasonName: "2013, Short Rain",
          StartDate: "8/1/2013",
          EndDate: null
        },
        {
          SeasonID: 140,
          SeasonName: "2014, Long Rain",
          StartDate: "3/1/2014",
          EndDate: null
        },
        {
          SeasonID: 150,
          SeasonName: "2014, Short Rain",
          StartDate: "8/1/2014",
          EndDate: null
        },
        {
          SeasonID: 160,
          SeasonName: "2015, Long Rain",
          StartDate: "3/1/2015",
          EndDate: null
        },
        {
          SeasonID: 170,
          SeasonName: "2015, Short Rain",
          StartDate: "8/1/2015",
          EndDate: null
        },
        {
          SeasonID: 180,
          SeasonName: "2016, Long Rain",
          StartDate: "3/1/2016",
          EndDate: null
        },
        {
          SeasonID: 190,
          SeasonName: "2016, Short Rain",
          StartDate: "8/1/2016",
          EndDate: null
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
     
    */
    return queryInterface.bulkDelete("Seasons", null, {});
  }
};
