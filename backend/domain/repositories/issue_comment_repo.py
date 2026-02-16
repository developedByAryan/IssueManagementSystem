from abc import ABC, abstractmethod
from typing import Optional, List
from uuid import UUID
from domain.entities.issue_comment import IssueComment


class IssueCommentRepository(ABC):
    @abstractmethod
    def get_by_id(self, comment_id: UUID) -> Optional[IssueComment]:
        raise NotImplementedError

    @abstractmethod
    def create(
        self,
        content: str,
        issue_id: UUID,
        user_id: UUID
    ) -> IssueComment:
        raise NotImplementedError

    @abstractmethod
    def get_all(self) -> List[IssueComment]:
        raise NotImplementedError

    @abstractmethod
    def update(self, comment_id: UUID, **kwargs) -> Optional[IssueComment]:
        raise NotImplementedError

    @abstractmethod
    def delete(self, comment_id: UUID) -> bool:
        raise NotImplementedError

    @abstractmethod
    def get_by_issue(self, issue_id: UUID) -> List[IssueComment]:
        raise NotImplementedError

    @abstractmethod
    def get_by_user(self, user_id: UUID) -> List[IssueComment]:
        raise NotImplementedError
