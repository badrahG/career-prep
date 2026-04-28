"""
Email service for verification and password reset.
Uses standard smtplib with Gmail SMTP.
Configure via .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, FRONTEND_URL
"""
import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr


# Load config from environment
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "CareerPrep")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def _send(to_email: str, subject: str, html_body: str) -> bool:
    """Low-level SMTP send. Returns True on success, False on failure."""
    if not SMTP_USER or not SMTP_PASSWORD:
        print("⚠ SMTP_USER / SMTP_PASSWORD not configured in .env")
        print(f"[EMAIL DEV MODE] To: {to_email}")
        print(f"[EMAIL DEV MODE] Subject: {subject}")
        print(f"[EMAIL DEV MODE] Body:\n{html_body}")
        return True  # Treat as success in dev mode so flow continues

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = formataddr((SMTP_FROM_NAME, SMTP_USER))
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        context = ssl.create_default_context()
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.starttls(context=context)
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"✗ Email send failed ({type(e).__name__})")
        return False


def _wrap_template(title: str, content_html: str) -> str:
    """Wrap content in a clean branded HTML template"""
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;background:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;max-width:560px;">
          <tr>
            <td style="padding:32px 32px 0 32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#1e3a8a;width:40px;height:40px;border-radius:4px;text-align:center;vertical-align:middle;color:white;font-weight:bold;font-size:14px;">CP</td>
                  <td style="padding-left:12px;font-size:18px;font-weight:600;color:#0f172a;">CareerPrep</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 8px 32px;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#0f172a;">{title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 32px 32px;color:#475569;font-size:14px;line-height:1.6;">
              {content_html}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:16px 0 0 0;font-size:12px;color:#94a3b8;">
                Хэрэв та энэ и-мэйлийг хүсээгүй бол зүгээр л үл тоож болно.<br>
                © 2026 CareerPrep. Бүх эрх хуулиар хамгаалагдсан.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def send_verification_email(to_email: str, first_name: str, token: str) -> bool:
    """Email verification link for new registrations"""
    link = f"{FRONTEND_URL}/verify-email?token={token}"
    content = f"""
      <p>Сайн байна уу, {first_name}!</p>
      <p>CareerPrep-д тавтай морилно уу. И-мэйл хаягаа баталгаажуулахын тулд доорх товчийг дарна уу:</p>
      <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr>
          <td style="background:#1e3a8a;border-radius:4px;">
            <a href="{link}" style="display:inline-block;padding:12px 28px;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">
              И-мэйл хаягаа баталгаажуулах
            </a>
          </td>
        </tr>
      </table>
      <p style="font-size:12px;color:#64748b;">Эсвэл энэ линкийг хөтчдөө хуулж тавьж болно:<br>
      <span style="word-break:break-all;color:#1e3a8a;">{link}</span></p>
      <p style="font-size:12px;color:#64748b;">Энэ линк <strong>24 цагийн</strong> дараа хүчингүй болно.</p>
    """
    return _send(to_email, "CareerPrep — И-мэйл баталгаажуулалт", _wrap_template("И-мэйл хаягаа баталгаажуулна уу", content))


def send_welcome_email(to_email: str, first_name: str) -> bool:
    """Welcome email after successful email verification"""
    content = f"""
      <p>Сайн байна уу, {first_name}!</p>
      <p>Таны и-мэйл хаяг амжилттай баталгаажлаа. CareerPrep-д тавтай морилно уу!</p>
      <p>Одоо та дараах боломжуудыг ашиглаж болно:</p>
      <ul style="color:#475569;font-size:14px;line-height:2;">
        <li>Мэргэжлийн <strong>CV</strong> үүсгэх</li>
        <li>Ярилцлагын асуулт <strong>судлах</strong></li>
        <li>Карьерын <strong>зөвлөмж</strong> унших</li>
        <li>Тэтгэлэг & Internship <strong>хайх</strong></li>
      </ul>
      <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr>
          <td style="background:#1e3a8a;border-radius:4px;">
            <a href="{FRONTEND_URL}/dashboard" style="display:inline-block;padding:12px 28px;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">
              Дашбоард руу очих →
            </a>
          </td>
        </tr>
      </table>
    """
    return _send(to_email, "CareerPrep-д тавтай морилно уу!", _wrap_template(f"Тавтай морилно уу, {first_name}!", content))


def send_deadline_reminder_email(to_email: str, first_name: str, scholarship_name: str, deadline_str: str, website_url: str = None) -> bool:
    """Reminder email 7 days before scholarship deadline"""
    register_btn = ""
    if website_url:
        register_btn = f"""
      <table cellpadding="0" cellspacing="0" style="margin:16px 0;">
        <tr>
          <td style="background:#1e3a8a;border-radius:4px;">
            <a href="{website_url}" style="display:inline-block;padding:12px 28px;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">
              Бүртгүүлэх →
            </a>
          </td>
        </tr>
      </table>"""
    content = f"""
      <p>Сайн байна уу, {first_name}!</p>
      <p>Та bookmark хийсэн тэтгэлгийн хугацаа <strong>7 хоногийн дотор</strong> дуусна:</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:16px 20px;margin:16px 0;">
        <p style="margin:0;font-size:16px;font-weight:700;color:#0f172a;">{scholarship_name}</p>
        <p style="margin:6px 0 0 0;font-size:13px;color:#ef4444;font-weight:600;">Дуусах огноо: {deadline_str}</p>
      </div>
      {register_btn}
      <p style="font-size:12px;color:#64748b;">Тэтгэлгийн дэлгэрэнгүйг харахын тулд <a href="{FRONTEND_URL}/scholarship" style="color:#1e3a8a;">энд дарна уу</a>.</p>
    """
    return _send(to_email, f"⏰ Тэтгэлгийн хугацаа дуусахад 7 хоног үлдлээ: {scholarship_name}", _wrap_template("Тэтгэлгийн хугацааны сануулга", content))


def send_password_reset_email(to_email: str, first_name: str, token: str) -> bool:
    """Password reset link"""
    link = f"{FRONTEND_URL}/reset-password?token={token}"
    content = f"""
      <p>Сайн байна уу, {first_name}!</p>
      <p>Таны бүртгэлийн нууц үгийг сэргээх хүсэлт ирлээ. Шинэ нууц үг тохируулахын тулд доорх товчийг дарна уу:</p>
      <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr>
          <td style="background:#1e3a8a;border-radius:4px;">
            <a href="{link}" style="display:inline-block;padding:12px 28px;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">
              Нууц үг сэргээх
            </a>
          </td>
        </tr>
      </table>
      <p style="font-size:12px;color:#64748b;">Эсвэл энэ линкийг хөтчдөө хуулж тавьж болно:<br>
      <span style="word-break:break-all;color:#1e3a8a;">{link}</span></p>
      <p style="font-size:12px;color:#64748b;">Энэ линк <strong>1 цагийн</strong> дараа хүчингүй болно. Хэрэв та энэ хүсэлт хийгээгүй бол и-мэйлийг үл тоогоорой, нууц үг өөрчлөгдөхгүй.</p>
    """
    return _send(to_email, "CareerPrep — Нууц үг сэргээх", _wrap_template("Нууц үгээ сэргээх", content))