"use strict";
const db = require("../../models");
const moment = require("moment");
const uuidV1 = require("uuid/v1");

export default {
  paymentProcessingError(record, error_message, index_number) {
    /* 
    When we are processing large amount of data in JSON format, we might have error in any of the objects
    here, we add errors to an object

    @input record: a dictionary object
    @input error_message: Text.
    @input index_number: in the JSON object, what is the index of the dictionary object?

    @output dictionary object clone with error_message and index_number
    */

    let data = record;

    data["err"] = error_message;
    data["status"] = 0;
    data["row_number"] = index_number + 1;
    data["index"] = index_number;

    return data;
  },
  async totalRepaidByCustomerPerSeason(customer_id, season_id) {
    /*
    What is the total repaid amount by the customer for the given season?
    
    @input customer_id: Number
    @input season_id: Number

    
    */
    return db.CustomerSummary.findOne({
      where: {
        SeasonId: season_id,
        CustomerID: customer_id
      },
      attributes: ["TotalRepaid"]
    })
      .then(data => {
        if (data == null) {
          return -1;
        }

        return +data["TotalRepaid"];
      })
      .catch(err => {
        return false;
      });
  },

  async addRepayments(customer_id, season_id, amount, date, parentid = null) {
    /*
    add a repayment with advancement and none advancement

    */

    let UUID;
    if (parentid == null) {
      // we haven't yet generated a parent id so do so now
      UUID = uuidV1(); // db.sequelize.Utils.generateUUID();
    } else {
      UUID = parentid;
    }
    const payload = {
      CustomerID: customer_id,
      SeasonID: season_id,
      Date: date,
      Amount: amount,
      ParentID: UUID
    };

    await db.Repayment.create(payload)
      .then(async function(result) {
        return UUID;
      })
      .catch(err => {
        console.log(err, " add repayments");
      });

    return UUID;
  },

  async latestSeason(customer_id) {
    /*
    For the given customer, get the latest season

    @output: false for technical failure,-1 if no latest season could be found, else dictionary object with:
    total_repaid: the total amount paid for the season
    season_id: id of the season which is the latest
    */

    return db.CustomerSummary.findOne({
      where: {
        CustomerID: customer_id
      },
      attributes: ["TotalRepaid", "SeasonId"],
      order: [["SeasonId", "DESC"]],
      limit: 1
    })
      .then(data => {
        if (data === null) {
          return -1;
        }

        return {
          season_id: data["SeasonId"],
          total_repaid: +data["TotalRepaid"],
          credit: +data["Credit"]
        };
      })
      .catch(err => {
        return false;
      });
  },

  async repayToSingleSeason(
    record,
    current_total_repaid,
    index_number,
    distributed = false
  ) {
    /*
    Update total paid amount of a specific season by the given customer

    @input record: a dictionary object which is part of the JSON object
    
    @input current_total_repaid: total repaid for the given season
    @input index_number: the index of the 'record' in the JSON object
    @input distributed: Boolean.Default false. Are we depositing to a single season or allocating them across the board.
    */
    const newTotalRepaid = record["Amount"] + current_total_repaid;

    return await db.CustomerSummary.update(
      { TotalRepaid: current_total_repaid + record["Amount"] },
      {
        where: {
          SeasonId: record["SeasonID"],
          CustomerID: record["CustomerID"]
        }
      }
    )
      .then(payment => {
        // done sucessfully

        record["status"] = 1;
        record["previous"] = current_total_repaid;
        record["current"] = newTotalRepaid;
        record["row_number"] = index_number + 1;
        record["index"] = index_number;
        record["distributed"] = distributed;

        return payment;
      })
      .catch(err => {
        this.paymentProcessingError(
          record,
          "Error Processing the payment",
          index_number
        );
        return err;
      });
  },

  async distributePayment(record, index_number) {
    /*
    Distribute the given payment among the seasons of the farmer
    @input record: a dictionary object containing data to be distributed.
    @input index_number: Number. index of the record in the JSON object that was submitted i.e. of the above record
    */

    // get list of farmers seasons with outstanding fees. If none exist, get the latest one and append it there
    console.log(record, " record");
    const SQL =
      "SELECT TotalRepaid, Credit,SeasonId FROM CustomerSummaries WHERE CustomerID=:customer_id AND TotalRepaid<Credit ORDER BY SeasonId ASC";

    let seasonsAffected = []; // as a result of distribution, which seasons of the farmer are affected?

    let paymentAdvances = []; // to keep track of positive and negative advances

    return db.sequelize
      .query(SQL, {
        replacements: { customer_id: record["CustomerID"] },
        type: db.sequelize.QueryTypes.SELECT
      })
      .then(async seasons => {
        // do we have data here?

        const totalIncompleteSeasons = seasons.length;
        console.log(totalIncompleteSeasons, " toal incomplete");

        if (totalIncompleteSeasons == 0) {
          // didn't find any so get the very latest season farmer is a member of

          await this.latestSeason(record["CustomerID"])
            .then(async data => {
              // did we find our latest object?

              if (data == -1) {
                this.paymentProcessingError(
                  record,
                  "All payments are settled and latest season could not be found",
                  index_number
                );
              } else if (data === false) {
                this.paymentProcessingError(
                  record,
                  "There was a technical error when processing the payment",
                  index_number
                );
              } else {
                // we found the latest season so update it

                const seasonalData = {
                  Amount: record["Amount"],
                  SeasonID: data["season_id"],
                  CustomerID: record["CustomerID"],
                  Date: record["Date"]
                };

                await this.repayToSingleSeason(
                  seasonalData,
                  data["total_repaid"],
                  index_number,
                  true
                )
                  .then(async result => {
                    // add the season that was affected now

                    seasonsAffected.push({
                      season_id: data["season_id"],
                      previous: data["total_repaid"],
                      addedAmount: record["Amount"],
                      extra: true
                    });

                    record["row_number"] = index_number + 1;
                    record["index"] = index_number;
                    record["distributed"] = true;
                    record["status"] = 1;
                    record["distributedSeasons"] = seasonsAffected;
                    record["paymentDistribution"] = paymentAdvances;

                    // add advanced payment here
                    await this.addRepayments(
                      record["CustomerID"],
                      data["season_id"],
                      record["Amount"],
                      record["Date"]
                    )
                      .then(result => {
                        paymentAdvances.push({
                          SeasonID: data["season_id"],
                          amount: record["Amount"],
                          extra: false,
                          uuid: result
                        });
                      })
                      .catch(err => {
                        console.err;
                      });
                  })
                  .catch(err => {
                    this.paymentProcessingError(
                      record,
                      "Cant deposit to the latest season and all seasons seem to have been settled",
                      index_number
                    );
                    console.log(err);
                  });
              }
            })
            .catch(err => {
              this.paymentProcessingError(
                record,
                "Cant deposit to the latest season and all seasons seem to have been settled",
                index_number
              );
            });
        } else {
          //we have at least one unpaid seasons. so distribute the money among them now

          let lastAmount = record["Amount"]; // that's the starting amount/ first plus advancement
          const UUID = uuidV1();
          for (let counter = 0; counter < totalIncompleteSeasons; counter++) {
            const totalPaidAlready = +seasons[counter]["TotalRepaid"];

            const credit = +seasons[counter]["Credit"];
            const seasonID = seasons[counter]["SeasonId"];

            const remainWith = credit - totalPaidAlready;
            let payableSlice = remainWith; // from the cash that was given, how much should we allocate to this season?
            // how much should we top up here now?

            await this.addRepayments(
              record["CustomerID"],
              seasonID,
              lastAmount,
              record["Date"],
              UUID
            )
              .then(result => {
                // add positive advancement for output
                paymentAdvances.push({
                  SeasonID: seasonID,
                  amount: lastAmount,
                  extra: false,
                  uuid: result
                });
              })
              .catch(err => {
                console.err;
              });

            if (lastAmount >= remainWith) {
              // create two advancements now then

              payableSlice = remainWith;

              lastAmount = lastAmount - remainWith;
            } else {
              // the amount paid or we remain with after we paid is less than what we awe
              payableSlice = lastAmount;
            }

            const seasonalData = {
              Amount: payableSlice,
              SeasonID: seasonID,
              CustomerID: record["CustomerID"],
              Date: record["Date"]
            };

            await this.repayToSingleSeason(
              seasonalData,
              totalPaidAlready,
              index_number,
              true
            ).then(result => {
              seasonsAffected.push({
                season_id: seasonID,
                previous: totalPaidAlready,
                addedAmount: payableSlice,
                extra: false
              });
            });

            await this.addRepayments(
              record["CustomerID"],
              seasonID,
              -lastAmount,
              record["Date"],
              UUID
            )
              .then(result => {
                //add negative advancment
                paymentAdvances.push({
                  SeasonID: seasonID,
                  amount: -lastAmount,
                  extra: false,
                  uuid: result
                });
              })
              .catch(err => {
                console.err;
              });

            record["distributedSeasons"] = seasonsAffected;
            record["row_number"] = index_number + 1;
            record["index"] = index_number;
            record["distributed"] = true;
            record["status"] = 1;
            record["extra"] = true;

            // did we run out of money?
            if (lastAmount <= 0) {
              break;
            }
          } //end of for loop for the seasons we awe money for

          // we have allocated money to our seasons now but we might have some money left still. Give remaining money to last season

          if (lastAmount > 0) {
            // yep. allocate it to the last season

            await this.latestSeason(record["CustomerID"]).then(async rec => {
              await this.addRepayments(
                record["CustomerID"],
                rec["season_id"],
                lastAmount,
                record["Date"],
                UUID
              )
                .then(result => {
                  paymentAdvances.push({
                    SeasonID: rec["season_id"],
                    amount: lastAmount,
                    extra: true,
                    uuid: result
                  });
                })
                .catch(err => {
                  console.err;
                });

              const seasonalData = {
                Amount: lastAmount,
                SeasonID: rec["season_id"],
                CustomerID: record["CustomerID"],
                Date: record["Date"]
              };

              await this.repayToSingleSeason(
                seasonalData,
                rec["total_repaid"],
                index_number,
                true
              ).then(result => {
                seasonsAffected.push({
                  season_id: rec["season_id"],
                  previous: rec["total_repaid"],
                  addedAmount: lastAmount,
                  extra: true
                });

                record["distributedSeasons"] = seasonsAffected;
                record["row_number"] = index_number + 1;
                record["index"] = index_number;
                record["distributed"] = true;
                record["status"] = 1;
                record["extra"] = true;
              });
            });
          }
          record["paymentDistribution"] = paymentAdvances;
        }
      })
      .catch(err => {
        this.paymentProcessingError(
          record,
          "No seasons were found for the payment to be distributed to",
          index_number
        );
        return err;
      });
  },

  async validatePaymentRecord(record) {
    /*
        Verifies the given payment is valid.

        @input info. An object array of keys:

            CustomerID
            SeasonID
            Date
            Amount
        
        @output an array of two indexs:

            [boolean, msg]

        if index 0 is true then, the payment uploaded was acceped/correct format
        else, it is false, requiring msg (index 1) to have an error message.

        
        V1: Verify the payment date and amount

        */

    const PaidOn = record["Date"];
    const amount = record["Amount"];
    const CustomerID = record["CustomerID"];

    let response = [false, ""]; // default false.

    if (moment(PaidOn, "D/M/YYYY", true).isValid()) {
      // the provided date is valid format.

      const int_re = /^[0-9]+$/;
      const dec_re = /^((\.\d+)|(\d+(\.\d+)?))$/;

      const amount_str = amount.toString(); // because regex cant be applied unto numbers.

      // at least one should pass
      if (
        amount != null &&
        (amount_str.match(int_re) || amount_str.match(dec_re))
      ) {
        // date and time is valid; check customer now
        await db.Customer.findOne({
          where: {
            CustomerID: CustomerID
          }
        })
          .then(async data => {
            if (data != null) {
              console.log(+record["SeasonID"], "season");
              if (+record["SeasonID"] > 0) {
                await db.Season.findOne({
                  where: {
                    SeasonID: +record["SeasonID"]
                  }
                })
                  .then(async repo => {
                    if (repo != null) {
                      response[0] = true;
                    } else {
                      response[1] = "Season ID not found";
                    }
                  })
                  .catch(err => {
                    response[1] =
                      "There was a technical error when validating the season";
                    return false;
                  });
              } else {
                response[0] = true;
              }
            } else {
              response[1] = "Customer ID not found";
            }
          })
          .catch(err => {
            response[1] =
              "There was a technical error when validating the customer";
            return false;
          });

        // response[0] = true;
      } else {
        // amount error

        response[1] = "The given amount is incorrect";
      }
    } else {
      // the payment date is not valid format

      response[1] = "The format of the payment date must be dd/mm/yyyy";
    }

    return response;
  }
};
