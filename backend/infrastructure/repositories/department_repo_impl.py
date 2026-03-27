from typing import Optional, List
from uuid import UUID
from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session
from domain.entities.issue import Issue
from domain.entities.department import Department
from domain.repositories.department_repo import DepartmentRepository


class SqlAlchemyDepartmentRepository(DepartmentRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, department_id: UUID) -> Optional[Department]:
        return self.db.query(Department).filter(Department.id == department_id).first()

    def get_by_name(self, name: str) -> Optional[Department]:
        return self.db.query(Department).filter(Department.name == name).first()

    def create(
        self,
        name: str,
        description: Optional[str] = None
    ) -> Department:
        department = Department(
            name=name,
            description=description
        )
        self.db.add(department)
        self.db.commit()
        self.db.refresh(department)
        return department

    def get_all(self) -> List[Department]:
        return self.db.query(Department).order_by(Department.name).all()

    def update(self, department_id: UUID, **kwargs) -> Optional[Department]:
        department = self.get_by_id(department_id)
        if not department:
            return None
        
        kwargs['updated_at'] = datetime.now()
        
        for key, value in kwargs.items():
            if hasattr(department, key):
                setattr(department, key, value)
        
        self.db.commit()
        self.db.refresh(department)
        return department

    def delete(self, department_id: UUID) -> bool:
        department = self.get_by_id(department_id)
        if not department:
            return False
        
        has_issues = self.db.query(Issue).filter(Issue.department_id == department.id).first()
        if has_issues:
            raise HTTPException(409, "Cannot delete department: issues exist. Reassign or delete issues first.")
        
        self.db.delete(department)
        self.db.commit()
        return True
