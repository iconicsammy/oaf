"use strict";
module.exports = (sequelize, DataTypes) => {
  const Season = sequelize.define(
    "Season",

    {
      SeasonID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        is: [0 - 9],
        unique: true,
        primaryKey: true
      },

      SeasonName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      StartDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      EndDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
      }
    },
    {}
  );
  Season.associate = function(models) {
    /*
      Feel free to delete this block. If ever season is related to some other model as a child/foreign,
      define the related models here as well
  
      */
  };
  return Season;
};
