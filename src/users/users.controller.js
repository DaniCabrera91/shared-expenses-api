const {
  currentUser: getCurrentUser,
  updateUser: updateUserService,
} = require("./users.service");

const { updateUserSchema } = require("./users.validation");

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

const updateUser = async (req, res, next) => {
  try {
    const validatedData = updateUserSchema.parse(req.body);

    const updatedUser = await updateUserService(req.user.id, validatedData);

    res.json({
      message: "Usuario actualizado correctamente",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { currentUser, updateUser };
