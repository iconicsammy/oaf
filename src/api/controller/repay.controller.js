const db = require("../../../models"); // The models we are going to use

import Helpers from "../helpers";
const moment = require("moment");

export default {
  seasonReports(req, res, next) {
    const query =
      "SELECT S.SeasonID, S.SeasonName, COUNT(DISTINCT SC.CustomerID) AS totalCustomers, SUM(SC.Credit) AS totalCredit, Sum(SC.TotalRepaid) AS totalRepaid FROM Seasons S LEFT JOIN CustomerSummaries SC ON S.SeasonID = SC.SeasonID GROUP BY S.SeasonID, S.SeasonName ";

    return db.sequelize
      .query(query, { type: db.sequelize.QueryTypes.SELECT })
      .then(seasons => res.status(200).send({ detail: seasons }))
      .catch(err => {
        console.log(
          "There was an error fetching seasons reports",
          JSON.stringify(err)
        );
        return res.status(500).send(err);
      });
  },

  async UploadRepayments(req, res, next) {
    /*
        Method: POST

        Description: upload repayment data that was posted via JSON.

        @input data: JSON. The repayments that were made by farmers and ready for upload.The data should conform to the following

                {
                    CustomerID: [0-9]Number ID of the farmer,
                    SeasonID: [1-9] or 0,empty or null if payment is not attached to a specific season
                    Date: Date payment was made
                    Amount: Decimal. The amount that was paid
                }
        
        @input view_pre_effect_only: integer. 1 check what sort of change the data is going to have on existing structure.
                                    if 0 (default), process the form without confirming with the client/customer.

        Response: if sucess, new status of payment status information, showing differences or what has been changed in the
                  payment information

                  if failure, display detailed and clear error message
        
        Constraint:
                Customer ID must exist
                
                Date must be after the season has started
                Amount must be a postive number, > 0
                
                

      */
    let data;
    try {
      let data = JSON.parse(req.body.content); // capture the JSON data that was pasted as part of the body. Parse it to JsON
      const total_repayments = data.length;
      // scenario 1: was data posted in the first place? If so, is it JSON

      if (total_repayments == 0 || data.constructor != Array) {
        err_msg = "Sorry, you must post/upload repayment data first";
      } else {
        // data is given and is an array. so time to loop it out now

        for (let counter = 0; counter <= total_repayments - 1; counter++) {
          // check the record now

          const validatePayment = await Helpers.validatePaymentRecord(
            data[counter]
          );

          if (validatePayment[0] == false) {
            // since failed,
            Helpers.paymentProcessingError(
              data[counter],
              validatePayment[1],
              counter
            );
          } else {
            // there is no error in the data passed.

            // add the payment information to the table now

            const DateParsed = moment(
              data[counter]["Date"],
              "DD/MM/YYYY"
            ).format("YYYY-MM-DD");

            const SeasonID = +data[counter]["SeasonID"];
            /*
            let createPaymentUpload = {
              CustomerID: data[counter]["CustomerID"],
              SeasonID: null,
              Date: DateParsed,
              Amount: data[counter]["Amount"]
            };

            if (SeasonID > 0) {
              createPaymentUpload["SeasonID"] = SeasonID;
            }
            */

            // Payment was recorded now attach to seasons via distribution. Season provided? If so, simply add
            if (SeasonID > 0) {
              //get the payment summary of the farmer for the given season

              await Helpers.addRepayments(
                data[counter]["CustomerID"],
                SeasonID,
                data[counter]["Amount"],
                data[counter]["Date"]
              )
                .then(async result => {
                  data[counter]["paymentDistribution"] = [
                    {
                      SeasonID: SeasonID,
                      amount: data[counter]["Amount"],
                      extra: false,
                      uuid: result
                    }
                  ];
                })
                .catch(err => {});

              await Helpers.totalRepaidByCustomerPerSeason(
                data[counter]["CustomerID"],
                data[counter]["SeasonID"]
              ).then(async TotalRepaid => {
                if (TotalRepaid == -1) {
                  Helpers.paymentProcessingError(
                    data[counter],
                    "Credit history for the farmer in the season not found",
                    counter
                  );
                } else if (TotalRepaid === false) {
                  Helpers.paymentProcessingError(
                    data[counter],
                    "There was an internal error processing the payment",
                    counter
                  );
                } else {
                  // we now have payment information of the farmer for the given season. so update it

                  await Helpers.repayToSingleSeason(
                    data[counter],
                    TotalRepaid,
                    counter
                  )
                    .then(result => {})
                    .catch(result => {});
                }
              }); // -1 Credit history not found, false tech error else total repaid until now for the given season
            } else {
              // season not specified. Hence distribute the given amount
              await Helpers.distributePayment(data[counter], counter)
                .then(done => {})
                .catch(err => {});
            }
          }
        }

        res.status(200).send({ detail: data });
        return;
      }
    } catch (error) {
      res.status(400).send({ detail: "Please provide a valid JSON data" });
      return;
    }
  }
};
