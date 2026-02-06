const { currentUser: getCurrentUser } = require("./users.service");

const currentUser = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user.id);

    res.json({
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { currentUser };
