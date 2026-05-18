const verifySuccessTemplate = (name) => {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 20px auto; border-radius: 24px; overflow: hidden; background: linear-gradient(145deg, #0f172a, #1e293b); box-shadow: 0 20px 45px rgba(15, 23, 42, 0.28); color: #f8fafc;">
        <div style="padding: 36px 32px 20px; text-align: center; background: radial-gradient(circle at top, rgba(74,222,128,0.25), transparent 55%);">
            <h1 style="margin: 0; font-size: 28px; letter-spacing: 3px; text-transform: uppercase; color: #ffffff;">Go N Shop</h1>
            <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.75); font-size: 14px; text-transform: uppercase; letter-spacing: 1.6px;">Account Verified</p>
        </div>

        <div style="padding: 20px 32px 36px; text-align: center;">
            <h2 style="color: #ffffff; margin-top: 0; margin-bottom: 14px; font-size: 30px; font-weight: 700;">Verification Successful</h2>

            <div style="display: inline-block; margin: 10px 0 18px; padding: 14px 28px; border-radius: 18px; background: linear-gradient(135deg, #22c55e, #16a34a); box-shadow: 0 12px 30px rgba(34, 197, 94, 0.35);">
                <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 1px;">Your account is now active</span>
            </div>

            <p style="font-size: 16px; line-height: 1.7; color: rgba(255,255,255,0.82); margin-bottom: 18px;">
                Hello ${name || "User"}, your email has been verified successfully.
            </p>

            <p style="font-size: 16px; line-height: 1.7; color: rgba(255,255,255,0.82); margin-bottom: 28px;">
                You can now log in to <strong style="color: #ffffff;">Go N Shop</strong> and enjoy all available features.
            </p>

            <p style="font-size: 14px; color: rgba(255,255,255,0.66); margin-top: 25px; line-height: 1.7;">
                If you did not perform this verification, please contact support immediately.
            </p>
        </div>

        <div style="padding: 18px 32px 28px; text-align: center; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5);">
            <p style="margin: 0;">&copy; 2026 <strong style="color: #ffffff;">Go N Shop</strong>. All rights reserved.</p>
            <p style="margin: 8px 0 0 0; color: #86efac; font-weight: 700; letter-spacing: 0.6px;">Stay Fast. Shop Easy.</p>
        </div>
    </div>`;
};

module.exports = verifySuccessTemplate;
