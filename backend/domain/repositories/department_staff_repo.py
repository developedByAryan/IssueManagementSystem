from abc import ABC, abstractmethod
from typing import Optional, List
from uuid import UUID
from domain.entities.department_staff import DepartmentStaff


class DepartmentStaffRepository(ABC):
    @abstractmethod
    def get_by_id(self, staff_id: UUID) -> Optional[DepartmentStaff]:
        raise NotImplementedError

    @abstractmethod
    def get_by_user_and_department(self, user_id: UUID, department_id: UUID) -> Optional[DepartmentStaff]:
        raise NotImplementedError

    @abstractmethod
    def get_by_user_id(self, user_id: UUID) -> List[DepartmentStaff]:
        raise NotImplementedError

    @abstractmethod
    def get_by_department_id(self, department_id: UUID) -> List[DepartmentStaff]:
        raise NotImplementedError

    @abstractmethod
    def create(self, user_id: UUID, department_id: UUID) -> DepartmentStaff:
        raise NotImplementedError

    @abstractmethod
    def get_all(self) -> List[DepartmentStaff]:
        raise NotImplementedError

    @abstractmethod
    def delete(self, staff_id: UUID) -> bool:
        raise NotImplementedError

    @abstractmethod
    def delete_by_user_id(self, user_id: UUID) -> bool:
        raise NotImplementedError
