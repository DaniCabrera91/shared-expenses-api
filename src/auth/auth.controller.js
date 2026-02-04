const { registerSchema, loginSchema } = require("./auth.validation");
const { registerUser, loginUser } = require("./auth.service");
const jwt = require("jsonwebtoken");


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

const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await loginUser(data);

    const token = jwt.sign(
  { email: user.email },
  process.env.JWT_SECRET,
  {
    subject: user.id,
    expiresIn: "1h",
  }
);

    res.json({
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
