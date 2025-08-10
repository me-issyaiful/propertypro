// src/utils/emailTemplates.ts

interface ConfirmationEmailOptions {
  userName: string;
  confirmationLink: string;
  expirationHours: number;
}

export const generateConfirmationEmail = (options: ConfirmationEmailOptions) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirm Your Email - Properti Pro</title>
        <style>
            body {
                font-family: 'Inter', sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                -webkit-text-size-adjust: none;
                -ms-text-size-adjust: none;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
            }
            .header {
                background-color: #F7941D;
                padding: 20px;
                text-align: center;
                color: #ffffff;
            }
            .header img {
                max-width: 50px;
                margin-bottom: 10px;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-family: 'Poppins', sans-serif;
            }
            .content {
                padding: 30px;
                color: #333333;
                line-height: 1.6;
            }
            .content h2 {
                color: #3D3D3D;
                font-family: 'Poppins', sans-serif;
                font-size: 22px;
                margin-top: 0;
            }
            .button-container {
                text-align: center;
                margin: 30px 0;
            }
            .button {
                display: inline-block;
                background-color: #F7941D;
                color: #ffffff;
                padding: 12px 25px;
                border-radius: 5px;
                text-decoration: none;
                font-weight: bold;
                font-family: 'Inter', sans-serif;
            }
            .footer {
                background-color: #f9f9f9;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #777777;
                border-top: 1px solid #eeeeee;
            }
            .footer p {
                margin: 5px 0;
            }
            .footer a {
                color: #F7941D;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://www.propertipro.id/logo.png" alt="Properti Pro Logo">
                <h1>Properti Pro</h1>
            </div>
            <div class="content">
                <h2>Welcome to Properti Pro, ${options.userName}!</h2>
                <p>Thank you for registering with Properti Pro. To activate your account and start exploring properties, please confirm your email address by clicking the button below:</p>
                <div class="button-container">
                    <a href="${options.confirmationLink}" class="button">Confirm Your Email</a>
                </div>
                <p>This confirmation link will expire in <strong>${options.expirationHours} hours</strong> for security reasons. If you did not register for an account with Properti Pro, please disregard this email.</p>
                <p>Thank you,<br>The Properti Pro Team</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Properti Pro. All rights reserved.</p>
                <p>Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta 10270</p>
                <p><a href="https://www.propertipro.id/kebijakan-privasi">Privacy Policy</a> | <a href="https://www.propertipro.id/syarat-ketentuan">Terms & Conditions</a></p>
            </div>
        </div>
    </body>
    </html>
  `;

  const textContent = `
    Welcome to Properti Pro, ${options.userName}!

    Thank you for registering with Properti Pro. To activate your account and start exploring properties, please confirm your email address by visiting the link below:

    ${options.confirmationLink}

    This confirmation link will expire in ${options.expirationHours} hours for security reasons. If you did not register for an account with Properti Pro, please disregard this email.

    Thank you,
    The Properti Pro Team

    ---
    © ${new Date().getFullYear()} Properti Pro. All rights reserved.
    Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta 10270
    Privacy Policy: https://www.propertipro.id/kebijakan-privasi
    Terms & Conditions: https://www.propertipro.id/syarat-ketentuan
  `;

  return { html: htmlContent, text: textContent };
};