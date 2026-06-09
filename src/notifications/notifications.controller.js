const notificationsService = require("./notifications.service");

const listGroupNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationsService.listGroupNotifications(
      req.params.groupId,
    );

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listGroupNotifications,
};
