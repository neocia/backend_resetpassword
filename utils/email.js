// ./utils/email.js

require("dotenv").config();

const nodemailer = require("nodemailer");

async function sendEmail (option) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOption = {
      from: process.env.EMAIL_ID,
      to: option.email,
      subject: option.subject,
      html: option.message,
    };
      await new Promise((resolve, reject) => {
        transporter.sendMail(mailOption, (err, info) => {
          if (err) {
            console.log(err);
            reject(err);  // Rejeita a promise em caso de erro
        } else {
            resolve(info);  // Resolve a promise em caso de sucesso
        }
    });
  });
  } catch (err) {
    console.log(err);
  }
};

const mailTemplate = (content, buttonUrl, buttonText) => {
  return `<!DOCTYPE html>
  <html>
  <body style="text-align: center; font-family: 'Verdana', serif; color: #000;">
    <div
      style="
        max-width: 400px;
        margin: 10px;
        background-color: #fafafa;
        padding: 25px;
        border-radius: 20px;
      "
    >
      <p style="text-align: left;">
        ${content}
      </p>
      <a href="${buttonUrl}" target="_blank">
        <button
          style="
            background-color: #444394;
            border: 0;
            width: 200px;
            height: 30px;
            border-radius: 6px;
            color: #fff;
          "
        >
          ${buttonText}
        </button>
      </a>
      <p style="text-align: left;">
        Se você não conseguir clicar no botão acima, copie e cole o URL abaixo na barra de endereço
      </p>
      <a href="${buttonUrl}" target="_blank">
          <p style="margin: 0px; text-align: left; font-size: 10px; text-decoration: none;">
            ${buttonUrl}
          </p>
      </a>
    </div>
  </body>
</html>`;
};

module.exports = { sendEmail, mailTemplate };
