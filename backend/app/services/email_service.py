import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    def __init__(self):
        self.reload_config()

    def reload_config(self):
        load_dotenv(override=True)
        self.smtp_host = os.getenv("SMTP_HOST", "smtp-relay.brevo.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("SMTP_FROM_EMAIL", "noreply@egovseva.gov.in")
        self.from_name = os.getenv("SMTP_FROM_NAME", "eGovSeva National Portal")
        self.timeout = float(os.getenv("SMTP_TIMEOUT", "5"))

    @property
    def is_configured(self) -> bool:
        self.reload_config()
        return bool(self.smtp_user and self.smtp_password)

    def send_otp_email(self, to_email: str, otp_code: str, purpose: str = "login") -> bool:
        """
        Sends a 6-digit OTP verification email directly to the citizen's real email inbox.
        Uses secure TLS/SSL SMTP connection with Brevo relay and branded government portal email layout.
        """
        self.reload_config()
        action_title = "Account Registration Verification" if purpose == "register" else "Instant Portal Sign-In"
        subject = f"eGovSeva Citizen Verification Code: {otp_code}"

        # Plaintext fallback
        text_content = f"""
eGovSeva - AI Public Service Assistant for Government Schemes
Official Citizen Verification

Your 6-Digit One-Time Password (OTP) for {action_title} is: {otp_code}

This code is valid for 5 minutes. Do not share this code with anyone.

If you did not request this verification, please ignore this email.
eGovSeva National Citizen Welfare Portal
        """

        # HTML Email with Official Govt Branding
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; }}
    .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }}
    .header {{ background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #881337 100%); color: #ffffff; padding: 28px 24px; text-align: center; }}
    .logo-title {{ font-size: 24px; font-weight: 900; letter-spacing: -0.5px; margin: 0; color: #ffffff; }}
    .logo-accent {{ color: #fb7185; }}
    .subtitle {{ font-size: 12px; color: #cbd5e1; margin-top: 4px; font-weight: 500; }}
    .content {{ padding: 32px 24px; text-align: center; color: #334155; }}
    .greeting {{ font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #0f172a; }}
    .purpose-desc {{ font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 24px; }}
    .otp-box {{ background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 18px; margin: 20px 0; }}
    .otp-label {{ font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; margin-bottom: 6px; }}
    .otp-code {{ font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #991b1b; font-family: 'Courier New', monospace; }}
    .expiry {{ font-size: 12px; color: #b45309; font-weight: 600; margin-top: 8px; }}
    .warning {{ font-size: 11px; color: #94a3b8; margin-top: 24px; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 16px; }}
    .footer {{ background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="logo-title">eGov<span class="logo-accent">Seva</span></h1>
      <p class="subtitle">AI Public Service Assistant for Citizen Welfare Schemes</p>
    </div>
    <div class="content">
      <div class="greeting">Citizen Security Verification</div>
      <p class="purpose-desc">
        You requested a 6-digit One-Time Password (OTP) for <strong>{action_title}</strong> on the eGovSeva Citizen Welfare Portal.
      </p>
      <div class="otp-box">
        <div class="otp-label">Your 6-Digit OTP Code</div>
        <div class="otp-code">{otp_code}</div>
        <div class="expiry">Valid for the next 5 minutes</div>
      </div>
      <p class="warning">
        Security Note: Never share this OTP with anyone. eGovSeva officials will never ask for your verification code or password.
      </p>
    </div>
    <div class="footer">
      Official Government Schemes AI Assistant • Multi-tier Security
    </div>
  </div>
</body>
</html>
        """

        if not self.is_configured:
            print(f"[EmailService WARNING] Brevo SMTP password not yet set. Set SMTP_PASSWORD in .env.")
            raise RuntimeError(
                f"Brevo SMTP password is missing in .env. Please provide the Brevo SMTP Key / Password to deliver real OTP emails to {to_email}."
            )

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.from_name} <{self.from_email}>"
            msg["To"] = to_email

            part1 = MIMEText(text_content, "plain")
            part2 = MIMEText(html_content, "html")
            msg.attach(part1)
            msg.attach(part2)

            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=self.timeout) as server:
                server.ehlo()
                server.starttls(context=context)
                server.ehlo()
                server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.from_email, to_email, msg.as_string())

            print(f"[EmailService SUCCESS] Sent real 6-digit OTP email via Brevo relay to {to_email}")
            return True

        except Exception as e:
            print(f"[EmailService ERROR] Failed to send email to {to_email}: {str(e)}")
            raise RuntimeError(f"Brevo email delivery to {to_email} failed: {str(e)}")

email_service = EmailService()

