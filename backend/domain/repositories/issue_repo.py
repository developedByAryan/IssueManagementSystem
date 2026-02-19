from abc import ABC, abstractmethod
from typing import Optional, List
from uuid import UUID
from domain.entities.issue import Issue, IssueStatus, IssuePriority


class IssueRepository(ABC):
    @abstractmethod
    def get_by_id(self, issue_id: UUID) -> Optional[Issue]:
        raise NotImplementedError

    @abstractmethod
    def create(
        self,
        title: str,
        description: str,
        department_id: UUID,
        reported_by: UUID,
        status: IssueStatus = IssueStatus.OPEN,
        priority: IssuePriority = IssuePriority.LOW,
    ) -> Issue:
        raise NotImplementedError

    @abstractmethod
    def get_all(self) -> List[Issue]:
        raise NotImplementedError

    @abstractmethod
    def update(self, issue_id: UUID, **kwargs) -> Optional[Issue]:
        raise NotImplementedError

    @abstractmethod
    def delete(self, issue_id: UUID) -> bool:
        raise NotImplementedError

    @abstractmethod
    def get_by_status(self, status: IssueStatus) -> List[Issue]:
        raise NotImplementedError

    @abstractmethod
    def get_by_department(self, department_id: UUID) -> List[Issue]:
        raise NotImplementedError

    @abstractmethod
    def get_by_reporter(self, user_id: UUID) -> List[Issue]:
        raise NotImplementedError



    @abstractmethod
    def assign_issue(self, issue_id: UUID, assignee_id: UUID) -> Optional[Issue]:
        raise NotImplementedError

    @abstractmethod
    def get_by_priority(self, priority: IssuePriority) -> List[Issue]:
        raise NotImplementedError
