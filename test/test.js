var chai = require("chai");
var expect = chai.expect;
var should = chai.should();
var chaiHttp = require("chai-http");
var app = require("../src/app");

chai.use(chaiHttp);

const data = [
  {
    SeasonID: "989898",
    CustomerID: "343",
    Amount: 50,
    Date: "12/12/2018"
  },
  {
    SeasonID: "8",
    CustomerID: "160",
    Amount: 500,
    Date: "12/12/2018"
  },
  {
    SeasonID: "1",
    CustomerID: 0,
    Amount: 500,
    Date: "12/12/2017"
  }
];

describe("/GET report seasons", () => {
  it("It should get all report of seasons", done => {
    chai
      .request(app)
      .get("/api/v1/report-seasons/")

      .end((err, res) => {
        res.should.have.status(200);
        res.body.detail.should.be.a("array");
        done();
      });
  });
});

describe("/POST newPayments", () => {
  it("It should create payments based on validation", done => {
    chai
      .request(app)
      .post("/api/v1/upload-repays/")
      .set("content-type", "application/json")
      .send({
        content: JSON.stringify(data)
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body.detail[0].err, "Customer ID not found");
        expect(res.body.detail[1].status, 1);
        expect(res.body.detail[1].distributed, false);
        expect(res.body.detail[2].status, 1);
        expect(res.body.detail[2].distributed, true);
        done();
      });
  });
});
