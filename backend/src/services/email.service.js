export const sendVerificationEmail = async (email, otp) => {
  const response = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME || "VerseHana",
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email,
          },
        ],
        subject: "Verify your VerseHana account",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
            <h2>Welcome to VerseHana!</h2>
            <p>Use the following verification code to activate your account:</p>
            <h1 style="letter-spacing: 8px;">${otp}</h1>
            <p>This code expires in 10 minutes.</p>
            <p>If you did not request this code, you can ignore this email.</p>
          </div>
        `,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Brevo email error:", error);

    throw new Error("Unable to send verification email.");
  }

  return response.json();
};