
export const forgotPasswordOTPTemplate = (name, otp) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset OTP</title>
  </head>

  <body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">

      <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
          <tr>
              <td align="center">

                  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 0 10px rgba(0,0,0,0.08);">

                      <tr>
                          <td style="background:#2563eb;padding:20px;text-align:center;">
                              <h1 style="color:#ffffff;margin:0;">
                                  Inventory Management System
                              </h1>
                          </td>
                      </tr>

                      <tr>
                          <td style="padding:35px;">

                              <h2 style="color:#111827;margin-top:0;">
                                  Password Reset Request
                              </h2>

                              <p style="font-size:16px;color:#555;">
                                  Hello <strong>${name}</strong>,
                              </p>

                              <p style="font-size:16px;color:#555;line-height:26px;">
                                  We received a request to reset your password
                                  for your Inventory Management account.
                                  Please use the OTP below to continue.
                              </p>

                              <div style="margin:35px 0;text-align:center;">
                                  <span style="
                                      display:inline-block;
                                      padding:16px 35px;
                                      background:#2563eb;
                                      color:#ffffff;
                                      font-size:30px;
                                      font-weight:bold;
                                      letter-spacing:8px;
                                      border-radius:8px;
                                  ">
                                      ${otp}
                                  </span>
                              </div>

                              <p style="font-size:15px;color:#444;">
                                  This OTP is valid for <strong>10 minutes</strong>.
                              </p>

                              <p style="font-size:15px;color:#444;">
                                  Do not share this OTP with anyone.
                              </p>

                              <hr style="margin:30px 0;border:none;border-top:1px solid #ddd;">

                              <p style="font-size:14px;color:#888;">
                                  If you did not request a password reset,
                                  please ignore this email.
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
