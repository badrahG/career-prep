from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True)
    name = Column(String(20), unique=True, nullable=False)  # "free", "pro"
    price = Column(Integer, nullable=False, default=0)       # MNT
    ai_limit = Column(Integer, nullable=False)
    tr_limit = Column(Integer, nullable=False)
    cover_letter = Column(Boolean, default=False, nullable=False)
    watermark = Column(Boolean, default=True, nullable=False)


class UserSubscription(Base):
    __tablename__ = "user_subscriptions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=False)
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    payment_ref = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class UsageTracking(Base):
    __tablename__ = "usage_tracking"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    ai_used = Column(Integer, default=0, nullable=False)
    tr_used = Column(Integer, default=0, nullable=False)
    tr_char_used = Column(Integer, default=0, nullable=False)
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)


class ExtraPackPurchase(Base):
    __tablename__ = "extra_pack_purchases"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ai_remaining = Column(Integer, default=20, nullable=False)
    tr_remaining = Column(Integer, default=10, nullable=False)
    tr_char_remaining = Column(Integer, default=80000, nullable=False)
    purchased_at = Column(DateTime(timezone=True), server_default=func.now())
    payment_ref = Column(String(200), nullable=True)
