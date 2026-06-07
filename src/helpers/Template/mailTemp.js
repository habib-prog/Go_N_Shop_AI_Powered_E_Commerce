const template = (otp, msg, sub) => {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 20px auto; border-radius: 24px; overflow: hidden; background: linear-gradient(145deg, #0f172a, #1e293b); box-shadow: 0 20px 45px rgba(15, 23, 42, 0.28); color: #f8fafc;">
        <!-- Header -->
        <div style="padding: 36px 32px 20px; text-align: center; background: radial-gradient(circle at top, rgba(248,113,113,0.28), transparent 55%);">
            <h1 style="margin: 0; font-size: 28px; letter-spacing: 3px; text-transform: uppercase; color: #ffffff;">Go N Shop</h1>
            <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.75); font-size: 14px; text-transform: uppercase; letter-spacing: 1.6px;">${sub || "Secure Verification"}</p>
        </div>

        <!-- Body -->
        <div style="padding: 20px 32px 36px; text-align: center;">
            <h2 style="color: #ffffff; margin-top: 0; margin-bottom: 14px; font-size: 30px; font-weight: 700;">${sub || "Verification Code"}</h2>
            <div style="display: inline-block; margin: 10px 0 6px; padding: 18px 34px; border-radius: 18px; background: linear-gradient(135deg, #ef4444, #f97316); box-shadow: 0 12px 30px rgba(239, 68, 68, 0.35);">
                <span style="font-size: 36px; font-weight: 800; color: #ffffff; letter-spacing: 10px;">${otp}</span>
            </div>

            <p style="font-size: 16px; line-height: 1.7; color: rgba(255,255,255,0.82); margin-bottom: 28px;">
                ${msg ? msg : "Hello! Use the verification code below to complete your request on <strong style='color:#ffffff;'>Go N Shop</strong>:"}
            </p>

            <p style="font-size: 14px; color: rgba(255,255,255,0.66); margin-top: 25px; line-height: 1.7;">
                This code is valid for <strong style="color: #ffffff;">10 minutes</strong>.<br>
                If you didn't request this code, please ignore this message.
            </p>
        </div>

        <!-- Footer -->
        <div style="padding: 18px 32px 28px; text-align: center; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5);">
            <p style="margin: 0;">&copy; 2026 <strong style="color: #ffffff;">Go N Shop</strong>. All rights reserved.</p>
            <p style="margin: 8px 0 0 0; color: #fca5a5; font-weight: 700; letter-spacing: 0.6px;">Stay Fast. Shop Easy.</p>
        </div>
    </div>`;
};

module.exports = template;
