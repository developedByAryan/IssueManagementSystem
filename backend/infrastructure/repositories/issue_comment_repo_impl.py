from typing import Optional, List
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session
from domain.entities.issue_comment import IssueComment
from domain.repositories.issue_comment_repo import IssueCommentRepository


class SqlAlchemyIssueCommentRepository(IssueCommentRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, comment_id: UUID) -> Optional[IssueComment]:
        return self.db.query(IssueComment).filter(IssueComment.id == comment_id).first()

    def create(
        self,
        content: str,
        issue_id: UUID,
        user_id: UUID
    ) -> IssueComment:
        comment = IssueComment(
            content=content,
            issue_id=issue_id,
            user_id=user_id
        )
        self.db.add(comment)
        self.db.commit()
        self.db.refresh(comment)
        return comment

    def get_all(self) -> List[IssueComment]:
        return self.db.query(IssueComment).all()

    def update(self, comment_id: UUID, **kwargs) -> Optional[IssueComment]:
        comment = self.get_by_id(comment_id)
        if not comment:
            return None
        
        kwargs['updated_at'] = datetime.now()
        
        for key, value in kwargs.items():
            if hasattr(comment, key):
                setattr(comment, key, value)
        
        self.db.commit()
        self.db.refresh(comment)
        return comment

    def delete(self, comment_id: UUID) -> bool:
        comment = self.get_by_id(comment_id)
        if not comment:
            return False
        
        self.db.delete(comment)
        self.db.commit()
        return True

    def get_by_issue(self, issue_id: UUID) -> List[IssueComment]:
        return self.db.query(IssueComment).filter(IssueComment.issue_id == issue_id).order_by(IssueComment.created_at).all()

    def get_by_user(self, user_id: UUID) -> List[IssueComment]:
        return self.db.query(IssueComment).filter(IssueComment.user_id == user_id).order_by(IssueComment.created_at.desc()).all()
