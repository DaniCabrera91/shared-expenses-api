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

    const refreshExpiresDays = Number(
      process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30,
    );

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: refreshExpiresDays * 24 * 60 * 60 * 1000,
    });

    res.json({ token });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refresh_token = req.cookies?.refresh_token;

    if (!refresh_token) {
      throw new Error("Refresh token requerido");
    }

    const { token, refreshToken } = await refreshAccessToken(refresh_token);

    const refreshExpiresDays = Number(
      process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30,
    );

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: refreshExpiresDays * 24 * 60 * 60 * 1000,
    });

    res.json({ token });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const refresh_token = req.cookies?.refresh_token;

    if (refresh_token) {
      await revokeRefreshToken(refresh_token);
      const isProd = process.env.NODE_ENV === "production";
      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.validatedData;

    const result = await require("./auth.service").changePassword(
      req.user.id,
      current_password,
      new_password,
    );

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh, logout, changePassword };
