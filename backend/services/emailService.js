import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async ({
  email,
  name,
  verificationToken,
}) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(
    verificationToken,
  )}`;

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [email],
    subject: "Verify your KonnectG email address",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verify your KonnectG email</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            font-family: Arial, Helvetica, sans-serif;
          "
        >
          <div
            style="
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            "
          >
            <div
              style="
                background-color: #7B0040;
                padding: 28px;
                text-align: center;
              "
            >
              <h1
                style="
                  margin: 0;
                  color: #ffffff;
                  font-size: 28px;
                "
              >
                Konnect<span style="color: #F5C518;">G</span>
              </h1>
            </div>

            <div style="padding: 36px 30px;">
              <h2
                style="
                  margin-top: 0;
                  color: #222222;
                "
              >
                Verify your email address
              </h2>

              <p
                style="
                  color: #555555;
                  font-size: 16px;
                  line-height: 1.6;
                "
              >
                Hi ${escapeHtml(name)},
              </p>

              <p
                style="
                  color: #555555;
                  font-size: 16px;
                  line-height: 1.6;
                "
              >
                Thanks for creating your KonnectG account.
                Please verify your email address by clicking
                the button below.
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a
                  href="${verificationUrl}"
                  style="
                    display: inline-block;
                    padding: 14px 28px;
                    background-color: #7B0040;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                  "
                >
                  Verify Email
                </a>
              </div>

              <p
                style="
                  color: #777777;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                This verification link will expire in 24 hours.
              </p>

              <p
                style="
                  color: #777777;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                If you didn't create a KonnectG account,
                you can safely ignore this email.
              </p>
            </div>

            <div
              style="
                padding: 20px 30px;
                background-color: #fafafa;
                border-top: 1px solid #eeeeee;
                text-align: center;
              "
            >
              <p
                style="
                  margin: 0;
                  color: #999999;
                  font-size: 12px;
                "
              >
                © ${new Date().getFullYear()} KonnectG.
                All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Verification email error:", error);

    throw new Error("Unable to send verification email.");
  }

  return data;
};

/**
 * Escape user-controlled values before inserting
 * them into HTML email content.
 */
const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const sendOwnerAssignmentEmail = async ({ email, name }) => {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [email],
    subject: "You are now a KonnectG Owner",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>KonnectG Owner Access</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            font-family: Arial, Helvetica, sans-serif;
          "
        >
          <div
            style="
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            "
          >
            <div
              style="
                background-color: #7B0040;
                padding: 28px;
                text-align: center;
              "
            >
              <h1
                style="
                  margin: 0;
                  color: #ffffff;
                  font-size: 28px;
                "
              >
                Konnect<span style="color: #F5C518;">G</span>
              </h1>
            </div>

            <div style="padding: 36px 30px;">
              <h2
                style="
                  margin-top: 0;
                  color: #222222;
                "
              >
                Owner access granted
              </h2>

              <p
                style="
                  color: #555555;
                  font-size: 16px;
                  line-height: 1.6;
                "
              >
                Hi ${escapeHtml(name)},
              </p>

              <p
                style="
                  color: #555555;
                  font-size: 16px;
                  line-height: 1.6;
                "
              >
                Your KonnectG account has been assigned
                the <strong>Owner</strong> role.
              </p>

              <p
                style="
                  color: #555555;
                  font-size: 16px;
                  line-height: 1.6;
                "
              >
                You can now log in to KonnectG and access
                the owner administration features.
              </p>

              <p
                style="
                  color: #777777;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                If you were not expecting this change,
                please contact the existing KonnectG owner.
              </p>
            </div>

            <div
              style="
                padding: 20px 30px;
                background-color: #fafafa;
                border-top: 1px solid #eeeeee;
                text-align: center;
              "
            >
              <p
                style="
                  margin: 0;
                  color: #999999;
                  font-size: 12px;
                "
              >
                © ${new Date().getFullYear()}
                KonnectG. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Owner assignment email error:", error);

    throw new Error("Unable to send owner assignment email.");
  }

  return data;
};
