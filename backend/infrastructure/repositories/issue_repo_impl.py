from typing import Optional, List
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session
from domain.entities.issue import Issue, IssueStatus, IssuePriority
from domain.repositories.issue_repo import IssueRepository


class SqlAlchemyIssueRepository(IssueRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, issue_id: UUID) -> Optional[Issue]:
        return self.db.query(Issue).filter(Issue.id == issue_id).first()

    def create(
        self,
        title: str,
        description: str,
        department_id: UUID,
        reported_by: UUID,
        status: IssueStatus = IssueStatus.OPEN,
        priority: IssuePriority = IssuePriority.LOW,
    ) -> Issue:
        issue = Issue(
            title=title,
            description=description,
            department_id=department_id,
            reported_by=reported_by,
            status=status,
            priority=priority,
        )
        self.db.add(issue)
        self.db.commit()
        self.db.refresh(issue)
        return issue

    def get_all(self) -> List[Issue]:
        return self.db.query(Issue).all()

    def update(self, issue_id: UUID, **kwargs) -> Optional[Issue]:
        issue = self.get_by_id(issue_id)
        if not issue:
            return None
        
        if 'status' in kwargs and kwargs['status'] == IssueStatus.RESOLVED and issue.status != IssueStatus.RESOLVED:
            kwargs['resolved_at'] = datetime.now()
        
        kwargs['updated_at'] = datetime.now()
        
        for key, value in kwargs.items():
            if hasattr(issue, key):
                setattr(issue, key, value)
        
        self.db.commit()
        self.db.refresh(issue)
        return issue

    def delete(self, issue_id: UUID) -> bool:
        issue = self.get_by_id(issue_id)
        if not issue:
            return False
        
        self.db.delete(issue)
        self.db.commit()
        return True

    def get_by_status(self, status: IssueStatus) -> List[Issue]:
        return self.db.query(Issue).filter(Issue.status == status).all()

    def get_by_department(self, department_id: UUID) -> List[Issue]:
        return self.db.query(Issue).filter(Issue.department_id == department_id).all()

    def get_by_reporter(self, user_id: UUID) -> List[Issue]:
        return self.db.query(Issue).filter(Issue.reported_by == user_id).all()



    def assign_issue(self, issue_id: UUID, assignee_id: UUID) -> Optional[Issue]:
        issue = self.get_by_id(issue_id)
        if not issue:
            return None
        
        issue.updated_at = datetime.now()
        
        self.db.commit()
        self.db.refresh(issue)
        return issue

    def get_by_priority(self, priority: IssuePriority) -> List[Issue]:
        return self.db.query(Issue).filter(Issue.priority == priority).all()
