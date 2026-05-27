"""Unit tests for app.services.email_service."""
from unittest.mock import patch, MagicMock


def test_send_no_smtp_logs_to_console(capsys):
    """Without SMTP config _send() prints to console and returns True."""
    from app.services.email_service import _send

    with patch("app.services.email_service.SMTP_USER", ""), \
         patch("app.services.email_service.SMTP_PASSWORD", ""):
        result = _send("user@example.com", "Test Subject", "<p>Hello</p>")

    assert result is True
    assert "[EMAIL DEV MODE]" in capsys.readouterr().out


def test_send_smtp_success():
    """_send() sends via smtplib and returns True on success."""
    from app.services.email_service import _send

    mock_server = MagicMock()
    with patch("app.services.email_service.SMTP_USER", "sender@gmail.com"), \
         patch("app.services.email_service.SMTP_PASSWORD", "secret"), \
         patch("smtplib.SMTP") as mock_cls:
        mock_cls.return_value.__enter__ = lambda s: mock_server
        mock_cls.return_value.__exit__ = MagicMock(return_value=False)
        result = _send("recipient@example.com", "Subj", "<p>Body</p>")

    assert result is True
    mock_server.starttls.assert_called_once()
    mock_server.login.assert_called_once_with("sender@gmail.com", "secret")
    mock_server.sendmail.assert_called_once()


def test_send_smtp_failure_returns_false():
    """_send() returns False on SMTP error without raising."""
    from app.services.email_service import _send

    with patch("app.services.email_service.SMTP_USER", "sender@gmail.com"), \
         patch("app.services.email_service.SMTP_PASSWORD", "secret"), \
         patch("smtplib.SMTP", side_effect=ConnectionRefusedError("no server")):
        result = _send("recipient@example.com", "Subj", "<p>Body</p>")

    assert result is False


def test_send_verification_email_calls_send():
    """send_verification_email calls _send with the correct address and subject."""
    from app.services.email_service import send_verification_email

    with patch("app.services.email_service._send") as mock_send:
        mock_send.return_value = True
        result = send_verification_email("u@example.com", "Нэр", "tok1")

    assert result is True
    to, subject, _ = mock_send.call_args[0]
    assert to == "u@example.com"
    assert "баталгаажуулалт" in subject.lower()


def test_send_password_reset_email_calls_send():
    """send_password_reset_email calls _send with the correct subject."""
    from app.services.email_service import send_password_reset_email

    with patch("app.services.email_service._send") as mock_send:
        mock_send.return_value = True
        result = send_password_reset_email("u@example.com", "Нэр", "tok2")

    assert result is True
    _, subject, _ = mock_send.call_args[0]
    assert "Нууц үг" in subject


def test_send_welcome_email_calls_send():
    """send_welcome_email calls _send."""
    from app.services.email_service import send_welcome_email

    with patch("app.services.email_service._send") as mock_send:
        mock_send.return_value = True
        result = send_welcome_email("u@example.com", "Нэр")

    assert result is True
    mock_send.assert_called_once()
