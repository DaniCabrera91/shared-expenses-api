const { registerSchema } = require("./auth.validation");
const { registerUser } = require("./auth.service");

const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await registerUser(data);
    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register };
