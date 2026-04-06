export const getOtpVerificationEmailTemplate = (otp, expiryTime, create, username, companyName) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>OTP Verification</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                background-color: #f4f6f8;
                font-family: Arial, sans-serif;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #4f46e5, #6d28d9);
                color: #ffffff;
                text-align: center;
                padding: 25px;
                font-size: 20px;
                font-weight: bold;
            }
            .content {
                padding: 30px;
                color: #333;
                text-align: center;
            }
            .content h2 {
                margin-bottom: 10px;
            }
            .content p {
                color: #555;
                line-height: 1.6;
            }
            .otp-box {
                margin: 25px 0;
                font-size: 28px;
                letter-spacing: 6px;
                font-weight: bold;
                color: #4f46e5;
                background: #f1f5f9;
                padding: 15px;
                border-radius: 8px;
                display: inline-block;
            }
            .warning {
                margin-top: 15px;
                font-size: 13px;
                color: #888;
            }
            .footer {
                text-align: center;
                padding: 20px;
                font-size: 12px;
                color: #999;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                Verify Your Email to ${create === 1 ? "Activate" : create === 2 ? "Recover" : "Deactivate"} Your Account
            </div>

            <div class="content">
                <h2>Hello, ${username}</h2>
                <p>
                    Use the following One-Time Password (OTP) to verify your email address.
                </p>

                <div class="otp-box">
                    ${otp}
                </div>

                <p>
                    This OTP is valid for <strong>${expiryTime} minutes</strong>. Please do not share it with anyone.
                </p>

                <p class="warning">
                    If you didn’t request this, you can safely ignore this email.
                </p>
            </div>

            <div class="footer">
                © ${new Date().getFullYear()} ${companyName}. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;
};