
export const resetPasswordTemplate = (name) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful</title>
  </head>

  <body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0"
            style="max-width:600px;width:100%;background:#ffffff;border-radius:10px;overflow:hidden;">

            <tr>
              <td style="background:#2563eb;padding:22px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;">
                  Inventory Management System
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:35px;">
                <h2 style="color:#111827;margin-top:0;">
                  Password Reset Successful!
                </h2>

                <p style="font-size:16px;color:#555;">
                  Hello <strong>${name}</strong>,
                </p>

                <p style="font-size:16px;color:#555;line-height:26px;">
                  Your password has been successfully reset.
                  You can now log in to your Inventory Management account
                  using your new password.
                </p>

                <div style="text-align:center;margin:30px 0;">
                  <span style="display:inline-block;background:#dcfce7;color:#166534;padding:14px 25px;border-radius:8px;font-weight:bold;">
                    Password Updated Successfully
                  </span>
                </div>

                <p style="font-size:15px;color:#444;line-height:24px;">
                  If you did not make this change, please contact your
                  administrator immediately and secure your account.
                </p>

                <hr style="margin:30px 0;border:none;border-top:1px solid #ddd;">

                <p style="font-size:14px;color:#888;">
                  This is an automated email. Please do not reply.
                </p>
              </td>
            </tr>

            <tr>
              <td style="background:#f8fafc;padding:20px;text-align:center;color:#777;font-size:13px;">
                &copy; ${new Date().getFullYear()} Inventory Management System
                <br>
                All Rights Reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};
