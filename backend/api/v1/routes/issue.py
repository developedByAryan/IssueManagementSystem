from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.deps import get_db, get_current_user, require_staff_or_admin
from domain.entities.user import User
from schemas.issue import IssueCreate, IssueUpdate, IssueOut, IssueCommentCreate, IssueCommentOut
from infrastructure.repositories.issue_repo_impl import SqlAlchemyIssueRepository
from infrastructure.repositories.issue_comment_repo_impl import SqlAlchemyIssueCommentRepository
from application.issue_usecase import IssueUsecase
import asyncio
from core.websocket import manager

router = APIRouter(prefix="/issues", tags=["issues"])


@router.post("/", response_model=IssueOut, status_code=status.HTTP_201_CREATED)
async def create_issue(
    issue_data: IssueCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new issue (requires authentication)."""
    issue_repo = SqlAlchemyIssueRepository(db)
    issue_usecase = IssueUsecase(issue_repo)
    
    try:
        issue = issue_usecase.create_issue(
            title=issue_data.title,
            description=issue_data.description,
            department_id=issue_data.department_id,
            reported_by=current_user.id,
            priority=issue_data.priority,
        )
        
        asyncio.create_task(manager.send_to_department(
            str(issue.department_id),
            {
                "type": "new_issue",
                "data": {
                    "id": str(issue.id),
                    "title": issue.title,
                    "description": issue.description,
                    "status": issue.status.value,
                    "priority": issue.priority.value,
                    "department_id": str(issue.department_id),
                    "reported_by": str(issue.reported_by),
                    "created_at": issue.created_at.isoformat()
                },
                "timestamp": issue.created_at.isoformat()
            }
        ))
        
        return issue
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[IssueOut])
def get_all_issues(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all issues (filtered by user role)."""
    issue_repo = SqlAlchemyIssueRepository(db)
    issue_usecase = IssueUsecase(issue_repo)
    
    issues = issue_usecase.get_all_issues(current_user.id, current_user.role)
    return issues


@router.get("/{issue_id}", response_model=IssueOut)
def get_issue(
    issue_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific issue by ID."""
    issue_repo = SqlAlchemyIssueRepository(db)
    issue_usecase = IssueUsecase(issue_repo)
    
    try:
        issue = issue_usecase.get_issue(issue_id)
        return issue
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{issue_id}", response_model=IssueOut)
async def update_issue(
    issue_id: str,
    issue_data: IssueUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an issue (requires appropriate permissions)."""
    issue_repo = SqlAlchemyIssueRepository(db)
    issue_usecase = IssueUsecase(issue_repo)
    
    try:
        update_data = issue_data.model_dump(exclude_unset=True)
        
        issue = issue_usecase.update_issue(
            issue_id=issue_id,
            user_id=current_user.id,
            user_role=current_user.role,
            **update_data
        )
        
    
        import datetime
        asyncio.create_task(manager.send_to_user(
            str(issue.reported_by),
            {
                "type": "issue_updated",
                "data": {
                    "id": str(issue.id),
                    "title": issue.title,
                    "description": issue.description,
                    "status": issue.status.value,
                    "priority": issue.priority.value,
                    "department_id": str(issue.department_id),
                    "reported_by": str(issue.reported_by),
                    "created_at": issue.created_at.isoformat()
                },
                "timestamp": datetime.datetime.now().isoformat()
            }
        ))
            
        return issue
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.delete("/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issue(
    issue_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an issue (admin or reporter only)."""
    issue_repo = SqlAlchemyIssueRepository(db)
    issue_usecase = IssueUsecase(issue_repo)
    
    try:
        issue_usecase.delete_issue(issue_id, current_user.id, current_user.role)
        return None
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.post("/{issue_id}/assign/{assignee_id}", response_model=IssueOut)
def assign_issue(
    issue_id: str,
    assignee_id: str,
    current_user: User = Depends(require_staff_or_admin),
    db: Session = Depends(get_db)
):
    """Assign an issue to a user (staff or admin only)."""
    issue_repo = SqlAlchemyIssueRepository(db)
    issue_usecase = IssueUsecase(issue_repo)
    
    try:
        issue = issue_usecase.assign_issue(issue_id, assignee_id, current_user.role)
        return issue
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.get("/status/{status}", response_model=List[IssueOut])
def get_issues_by_status(
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get issues by status."""
    issue_repo = SqlAlchemyIssueRepository(db)
    issue_usecase = IssueUsecase(issue_repo)
    
    try:
        issues = issue_usecase.get_issues_by_status(status)
        return issues
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/department/{department_id}", response_model=List[IssueOut])
def get_issues_by_department(
    department_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get issues by department."""
    issue_repo = SqlAlchemyIssueRepository(db)
    issue_usecase = IssueUsecase(issue_repo)
    
    issues = issue_usecase.get_issues_by_department(department_id)
    return issues


@router.post("/{issue_id}/comments", response_model=IssueCommentOut, status_code=status.HTTP_201_CREATED)
def add_comment(
    issue_id: str,
    comment_data: IssueCommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a comment to an issue."""
    comment_repo = SqlAlchemyIssueCommentRepository(db)
    
    comment = comment_repo.create(
        content=comment_data.content,
        issue_id=issue_id,
        user_id=current_user.id
    )
    return comment


@router.get("/{issue_id}/comments", response_model=List[IssueCommentOut])
def get_issue_comments(
    issue_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all comments for an issue."""
    comment_repo = SqlAlchemyIssueCommentRepository(db)
    comments = comment_repo.get_by_issue(issue_id)
    return comments

