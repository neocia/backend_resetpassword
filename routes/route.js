// ./routes/route.js

require("dotenv").config();

const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const router = express.Router();

const db = require("../db");
const { sendEmail, mailTemplate } = require("../utils/email");

const NumSaltRounds = Number(process.env.NO_OF_SALT_ROUNDS);

router.post("/forgotPassword", async (req, res) => {
  try {
    const email = req.body.email;
    const user = await db.get_user_by_email(email);

    if (!user || user.length === 0) {
      res.json({
        success: false,
        message: "Você não está cadastrado!",
      });
    } else {
      const token = crypto.randomBytes(20).toString("hex");
      const resetToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      await db.update_forgot_password_token(user[0].ID_ls, resetToken);

      const mailOption = {
        email: email,
        subject: "Esqueci o link da senha",
        message: mailTemplate(
          "Recebemos uma solicitação para redefinir sua senha. Por favor, redefina sua senha usando o link abaixo.",
          `${process.env.FRONTEND_URL}/redefinir-senha?id=${user[0].ID_ls}&token=${resetToken}`,
          "Redefinir Senha"
        ),
      };
      await sendEmail(mailOption);
      res.json({
        success: true,
        message: "Um link de redefinição de senha foi enviado para seu e-mail.",
      });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/ResetarSenha", async (req, res) => {
  try {
    const { password, token, userId } = req.body;
    const userToken = await db.get_password_reset_token(userId);
    if (!res || res.length === 0) {
      res.json({
        success: false,
        message: "Ocorreu algum problema!",
      });
    } else {
      const currDateTime = new Date();
      const expiresAt = new Date(userToken[0].expires_at);
      if (currDateTime > expiresAt) {
        res.json({
          success: false,
          message: "O link de redefinição de senha expirou!",
        });
      } else if (userToken[0].token !== token) {
        res.json({
          success: false,
          message: "O link de redefinição de senha é inválido!",
        });
      } else {
        await db.update_password_reset_token(userId);
        const salt = await bcrypt.genSalt(NumSaltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        await db.update_user_password(userId, hashedPassword);
        res.json({
          success: true,
          message: "Sua redefinição de senha foi realizada com sucesso!",
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
