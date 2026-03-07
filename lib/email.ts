import nodemailer from "nodemailer";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

// Configure email transporter
const getEmailTransporter = () => {
  if (process.env.NODE_ENV === "production") {
    return nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
  } else {
    // For development, use Ethereal Email
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "ethereal.user", // These will be overwritten by createTestAccount if not provided, but good to have placeholders or just rely on createTestAccount logic in a real app setup if persistent.
        // Actually, for simplicity in dev, we'll let nodemailer create a test account on the fly if we want, OR just print the URL.
        // But to avoid creating a new account every time, it's better if the user provides one or we accept that it might create one.
        // For this implementation, let's use a robust approach for dev:
      },
    });
  }
};

// Helper to create a test account if needed (only for dev/testing locally if you want to persist)
// But for now, let's just use the standard Nodemailer example approach for test accounts if we want to preview.
// A better approach for this specific request:
const createTransporter = async () => {
  if (process.env.NODE_ENV === "production") {
    return nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

export const sendEmail = async (data: EmailPayload) => {
  const transporter = await createTransporter();

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    ...data,
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("Preview URL: " + nodemailer.getTestMessageUrl(info));
  }

  return info;
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const url = `${process.env.NEXTAUTH_URL}/auth/verify-email/${token}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify your email</h2>
      <p>Thanks for signing up for Chess App! Please verify your email address by clicking the link below:</p>
      <a href="${url}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>Or copy and paste this link into your browser:</p>
      <p><a href="${url}">${url}</a></p>
      <p>If you didn't sign up, you can ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Verify your email - Chess App",
    html,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const url = `${process.env.NEXTAUTH_URL}/auth/reset-password/${token}`;

  const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <a href="${url}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${url}">${url}</a></p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `;

  return sendEmail({
    to: email,
    subject: "Reset your password - Chess App",
    html,
  });
};

export const sendPasswordChangedEmail = async (email: string) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Changed</h2>
      <p>Your password for Chess App has been changed successfully.</p>
      <p>If you did not make this change, please contact support immediately.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Password changed successfully - Chess App",
    html,
  });
};
