const { registerUser, loginUser } = require("./auth.service");
const jwt = require("jsonwebtoken");

const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.validatedData);
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

const login = async (req, res, next) => {
  try {
    const user = await loginUser(req.validatedData);

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      subject: user.id,
      expiresIn: "1h",
    });

    res.json({
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
