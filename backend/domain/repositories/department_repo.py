from abc import ABC, abstractmethod
from typing import Optional, List
from uuid import UUID
from domain.entities.department import Department


class DepartmentRepository(ABC):
    @abstractmethod
    def get_by_id(self, department_id: UUID) -> Optional[Department]:
        raise NotImplementedError

    @abstractmethod
    def get_by_name(self, name: str) -> Optional[Department]:
        raise NotImplementedError

    @abstractmethod
    def create(
        self,
        name: str,
        description: Optional[str] = None
    ) -> Department:
        raise NotImplementedError

    @abstractmethod
    def get_all(self) -> List[Department]:
        raise NotImplementedError

    @abstractmethod
    def update(self, department_id: UUID, **kwargs) -> Optional[Department]:
        raise NotImplementedError

    @abstractmethod
    def delete(self, department_id: UUID) -> bool:
        raise NotImplementedError
