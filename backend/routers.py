from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from models import User, Feedback, RoleEnum, FeedbackRequest, FeedbackComment
from schemas import UserOut, FeedbackOut, FeedbackCreate, Token, FeedbackRequestCreate, FeedbackRequestOut, FeedbackCommentCreate, FeedbackCommentOut
from auth import verify_password, get_password_hash, create_access_token, get_user_by_email
from deps import get_current_user, require_role
from fastapi.security import OAuth2PasswordRequestForm
from typing import List
from sqlalchemy import func

router = APIRouter()

# Auth
@router.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token = create_access_token(data={"user_id": user.id, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

# User info
@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Manager: get team
@router.get("/team", response_model=List[UserOut])
def get_team(current_user: User = Depends(require_role(RoleEnum.manager)), db: Session = Depends(get_db)):
    return db.query(User).filter(User.manager_id == current_user.id).all()

# Feedback CRUD
@router.post("/feedback", response_model=FeedbackOut)
def create_feedback(feedback: FeedbackCreate, current_user: User = Depends(require_role(RoleEnum.manager)), db: Session = Depends(get_db)):
    fb = Feedback(**feedback.dict(), manager_id=current_user.id)
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb

@router.get("/feedback/{employee_id}", response_model=List[FeedbackOut])
def get_feedback(employee_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Manager can see their team, employee can see their own
    if current_user.role == RoleEnum.manager:
        if not db.query(User).filter(User.id == employee_id, User.manager_id == current_user.id).first():
            raise HTTPException(status_code=403, detail="Not your team member")
    elif current_user.role == RoleEnum.employee:
        if current_user.id != employee_id:
            raise HTTPException(status_code=403, detail="Not allowed")
    return db.query(Feedback).filter(Feedback.employee_id == employee_id).all()

@router.put("/feedback/{feedback_id}", response_model=FeedbackOut)
def update_feedback(feedback_id: int, feedback: FeedbackCreate, current_user: User = Depends(require_role(RoleEnum.manager)), db: Session = Depends(get_db)):
    fb = db.query(Feedback).filter(Feedback.id == feedback_id, Feedback.manager_id == current_user.id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    for key, value in feedback.dict().items():
        setattr(fb, key, value)
    db.commit()
    db.refresh(fb)
    return fb

@router.post("/feedback/{feedback_id}/acknowledge", response_model=FeedbackOut)
def acknowledge_feedback(feedback_id: int, current_user: User = Depends(require_role(RoleEnum.employee)), db: Session = Depends(get_db)):
    fb = db.query(Feedback).filter(Feedback.id == feedback_id, Feedback.employee_id == current_user.id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    fb.acknowledged = True
    db.commit()
    db.refresh(fb)
    return fb

@router.get("/dashboard/manager")
def manager_dashboard(current_user: User = Depends(require_role(RoleEnum.manager)), db: Session = Depends(get_db)):
    # Get team members
    team = db.query(User).filter(User.manager_id == current_user.id).all()
    result = []
    for member in team:
        feedbacks = db.query(Feedback).filter(Feedback.employee_id == member.id).all()
        count = len(feedbacks)
        # Sentiment trend: count of each sentiment
        sentiments = {"positive": 0, "neutral": 0, "negative": 0}
        for fb in feedbacks:
            sentiments[fb.sentiment] += 1
        result.append({
            "id": member.id,
            "name": member.name,
            "email": member.email,
            "feedback_count": count,
            "sentiments": sentiments
        })
    return result

# Employee: request feedback
@router.post("/feedback-request", response_model=FeedbackRequestOut)
def create_feedback_request(request: FeedbackRequestCreate, current_user: User = Depends(require_role(RoleEnum.employee)), db: Session = Depends(get_db)):
    # Assign to their manager
    if not current_user.manager_id:
        raise HTTPException(status_code=400, detail="No manager assigned")
    req = FeedbackRequest(
        employee_id=current_user.id,
        manager_id=current_user.manager_id,
        message=request.message,
        tags=request.tags
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

# Manager: view feedback requests for their team
@router.get("/feedback-requests", response_model=List[FeedbackRequestOut])
def get_feedback_requests(current_user: User = Depends(require_role(RoleEnum.manager)), db: Session = Depends(get_db), fulfilled: bool = Query(False)):
    return db.query(FeedbackRequest).filter(FeedbackRequest.manager_id == current_user.id, FeedbackRequest.fulfilled == fulfilled).all()

# Manager: mark feedback request as fulfilled
@router.post("/feedback-request/{request_id}/fulfill", response_model=FeedbackRequestOut)
def fulfill_feedback_request(request_id: int, current_user: User = Depends(require_role(RoleEnum.manager)), db: Session = Depends(get_db)):
    req = db.query(FeedbackRequest).filter(FeedbackRequest.id == request_id, FeedbackRequest.manager_id == current_user.id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    req.fulfilled = True
    db.commit()
    db.refresh(req)
    return req

# Add a comment to feedback
@router.post("/feedback/{feedback_id}/comment", response_model=FeedbackCommentOut)
def add_comment(feedback_id: int, comment: FeedbackCommentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    fb = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    c = FeedbackComment(
        feedback_id=feedback_id,
        user_id=current_user.id,
        comment=comment.comment
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return c

# Get comments for feedback
@router.get("/feedback/{feedback_id}/comments", response_model=List[FeedbackCommentOut])
def get_comments(feedback_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(FeedbackComment).filter(FeedbackComment.feedback_id == feedback_id).order_by(FeedbackComment.created_at).all()

@router.delete("/feedback/{feedback_id}", status_code=204)
def delete_feedback(feedback_id: int, current_user: User = Depends(require_role(RoleEnum.manager)), db: Session = Depends(get_db)):
    fb = db.query(Feedback).filter(Feedback.id == feedback_id, Feedback.manager_id == current_user.id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    db.delete(fb)
    db.commit()
    return None 