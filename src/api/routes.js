const express = require("express");
import RepayController from "./controller/repay.controller";
const router = express.Router();

//build routes of the application now

router.post("/upload-repays/", RepayController.UploadRepayments);
router.get("/report-seasons/", RepayController.seasonReports);
export default router;
