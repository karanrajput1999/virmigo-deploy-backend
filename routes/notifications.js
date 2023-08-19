const express = require("express");
const notificationsRouter = express.Router();
const NotificationController = require("../controllers/NotificationController");

notificationsRouter.get("/", NotificationController.notificationGet);

module.exports = notificationsRouter;
