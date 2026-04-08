const {
  registerUser,
  loginUser,
  createRefreshToken,
  refreshAccessToken,
  revokeRefreshToken,
} = require("./auth.service");
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

    const refreshToken = await createRefreshToken(user.id);

    res.json({
      token,
      refresh_token: refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refresh_token } = req.validatedData;
    const { token, refreshToken } = await refreshAccessToken(refresh_token);

    res.json({
      token,
      refresh_token: refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await revokeRefreshToken(req.validatedData.refresh_token);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh, logout };
