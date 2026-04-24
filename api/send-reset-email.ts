import nodemailer from "nodemailer";

type SendResetEmailBody = {
  email?: string;
  resetToken?: string;
};

type VercelLikeRequest = {
  method?: string;
  body: SendResetEmailBody;
};

type VercelLikeResponse = {
  status: (code: number) => VercelLikeResponse;
  json: (body: unknown) => void;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} belum dikonfigurasi.`);
  }

  return value;
}

export default async function handler(
  req: VercelLikeRequest,
  res: VercelLikeResponse,
) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  try {
    const body = req.body as SendResetEmailBody;
    const email = body.email?.trim();
    const resetToken = body.resetToken?.trim();

    if (!email || !resetToken) {
      res.status(400).json({
        success: false,
        error: "Email dan reset token wajib diisi.",
      });
      return;
    }

    const gmailUser = getRequiredEnv("GMAIL_USER");
    const gmailAppPassword = getRequiredEnv("GMAIL_APP_PASSWORD");
    const appUrl = getRequiredEnv("KBBU_URL").replace(/\/$/, "");

    const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(email)}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    await transporter.sendMail({
      from: `"Kasta Beaute" <${gmailUser}>`,
      to: email,
      subject: "Reset Password Kasta Beaute",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #3f342f;">
          <h2 style="margin-bottom: 12px;">Reset Password</h2>
          <p>Kami menerima permintaan untuk reset password akun Kasta Beaute kamu.</p>
          <p>
            Klik link berikut untuk membuat password baru:
          </p>
          <p>
            <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#b76e79;color:#ffffff;text-decoration:none;">
              Reset Password
            </a>
          </p>
          <p>Atau buka link ini secara manual:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Email reset password berhasil dikirim.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengirim email.",
    });
  }
}
