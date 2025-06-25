from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Boolean, Text
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class RoleEnum(str, enum.Enum):
    manager = "manager"
    employee = "employee"

class SentimentEnum(str, enum.Enum):
    positive = "positive"
    neutral = "neutral"
    negative = "negative"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    team_members = relationship("User", remote_side=[id])
    feedback_given = relationship("Feedback", back_populates="manager", foreign_keys='Feedback.manager_id')
    feedback_received = relationship("Feedback", back_populates="employee", foreign_keys='Feedback.employee_id')

class Feedback(Base):
    __tablename__ = "feedbacks"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    strengths = Column(Text, nullable=False)
    areas_to_improve = Column(Text, nullable=False)
    sentiment = Column(Enum(SentimentEnum), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    acknowledged = Column(Boolean, default=False)
    tags = Column(String, nullable=True)  # Comma-separated tags

    employee = relationship("User", foreign_keys=[employee_id], back_populates="feedback_received")
    manager = relationship("User", foreign_keys=[manager_id], back_populates="feedback_given")

class FeedbackRequest(Base):
    __tablename__ = "feedback_requests"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=True)
    tags = Column(String, nullable=True)  # Comma-separated tags
    created_at = Column(DateTime, default=datetime.utcnow)
    fulfilled = Column(Boolean, default=False)

    employee = relationship("User", foreign_keys=[employee_id])
    manager = relationship("User", foreign_keys=[manager_id])

class FeedbackComment(Base):
    __tablename__ = "feedback_comments"
    id = Column(Integer, primary_key=True, index=True)
    feedback_id = Column(Integer, ForeignKey("feedbacks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    feedback = relationship("Feedback")
    user = relationship("User") 