from uuid import UUID
from typing import List, Optional
from domain.repositories.issue_repo import IssueRepository
from domain.entities.issue import Issue, IssuePriority, IssueStatus
from domain.entities.user import UserRole


class IssueUsecase:

    def __init__(self, issue_repo: IssueRepository):
        self.issue_repo = issue_repo

    def create_issue(
        self,
        title: str,
        description: str,
        department_id: UUID,
        reported_by: UUID,
        priority: str = "LOW",
    ) -> Issue:
        """Create a new issue."""
        try:
            priority_enum = IssuePriority[priority.upper()]
        except KeyError:
            raise ValueError(f"Invalid priority: {priority}")
        
        issue = self.issue_repo.create(
            title=title,
            description=description,
            department_id=department_id,
            reported_by=reported_by,
            priority=priority_enum,
        )
        return issue

    def get_issue(self, issue_id: UUID) -> Issue:
        """Get issue by ID."""
        issue = self.issue_repo.get_by_id(issue_id)
        if not issue:
            raise ValueError("Issue not found")
        return issue

    def get_all_issues(self, user_id: UUID, user_role: UserRole) -> List[Issue]:
        """Get all issues based on user role."""
        if user_role == UserRole.ADMIN or user_role == UserRole.DEPARTMENT_STAFF:
            print(user_role)
            return self.issue_repo.get_all()
        else:
            reported = self.issue_repo.get_by_reporter(user_id)
            
            issue_dict = {issue.id: issue for issue in reported}
            return list(issue_dict.values())

    def update_issue(
        self,
        issue_id: UUID,
        user_id: UUID,
        user_role: UserRole,
        **kwargs
    ) -> Issue:
        """Update an issue."""
        issue = self.get_issue(issue_id)
        
        if user_role not in [UserRole.ADMIN, UserRole.DEPARTMENT_STAFF]:
            if issue.reported_by != user_id:
                raise PermissionError("You don't have permission to update this issue")
        
        if 'status' in kwargs and isinstance(kwargs['status'], str):
            try:
                kwargs['status'] = IssueStatus[kwargs['status'].upper()]
            except KeyError:
                raise ValueError(f"Invalid status: {kwargs['status']}")
        
        if 'priority' in kwargs and isinstance(kwargs['priority'], str):
            try:
                kwargs['priority'] = IssuePriority[kwargs['priority'].upper()]
            except KeyError:
                raise ValueError(f"Invalid priority: {kwargs['priority']}")
        
        updated_issue = self.issue_repo.update(issue_id, **kwargs)
        if not updated_issue:
            raise ValueError("Failed to update issue")
        return updated_issue

    def delete_issue(self, issue_id: UUID, user_id: UUID, user_role: UserRole) -> bool:
        """Delete an issue."""
        issue = self.get_issue(issue_id)
        
        if user_role != UserRole.ADMIN and issue.reported_by != user_id:
            raise PermissionError("You don't have permission to delete this issue")
        
        return self.issue_repo.delete(issue_id)

    def assign_issue(self, issue_id: UUID, assignee_id: UUID, user_role: UserRole) -> Issue:
        """Assign an issue to a user."""
        if user_role not in [UserRole.ADMIN, UserRole.DEPARTMENT_STAFF]:
            raise PermissionError("Only staff or admin can assign issues")
        
        issue = self.issue_repo.assign_issue(issue_id, assignee_id)
        if not issue:
            raise ValueError("Failed to assign issue")
        return issue

    def get_issues_by_status(self, status: str) -> List[Issue]:
        """Get issues by status."""
        try:
            status_enum = IssueStatus[status.upper()]
        except KeyError:
            raise ValueError(f"Invalid status: {status}")
        
        return self.issue_repo.get_by_status(status_enum)

    def get_issues_by_department(self, department_id: UUID) -> List[Issue]:
        """Get issues by department."""
        return self.issue_repo.get_by_department(department_id)
