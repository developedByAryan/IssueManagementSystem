from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session
from domain.entities.department_staff import DepartmentStaff
from domain.repositories.department_staff_repo import DepartmentStaffRepository


class SqlAlchemyDepartmentStaffRepository(DepartmentStaffRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, staff_id: UUID) -> Optional[DepartmentStaff]:
        return self.db.query(DepartmentStaff).filter(DepartmentStaff.id == staff_id).first()

    def get_by_user_and_department(self, user_id: UUID, department_id: UUID) -> Optional[DepartmentStaff]:
        return self.db.query(DepartmentStaff).filter(
            DepartmentStaff.user_id == user_id,
            DepartmentStaff.department_id == department_id
        ).first()

    def get_by_user_id(self, user_id: UUID) -> List[DepartmentStaff]:
        return self.db.query(DepartmentStaff).filter(DepartmentStaff.user_id == user_id).all()

    def get_by_department_id(self, department_id: UUID) -> List[DepartmentStaff]:
        return self.db.query(DepartmentStaff).filter(DepartmentStaff.department_id == department_id).all()

    def create(self, user_id: UUID, department_id: UUID) -> DepartmentStaff:
        staff = DepartmentStaff(user_id=user_id, department_id=department_id)
        self.db.add(staff)
        self.db.commit()
        self.db.refresh(staff)
        return staff

    def get_all(self) -> List[DepartmentStaff]:
        return self.db.query(DepartmentStaff).all()

    def delete(self, staff_id: UUID) -> bool:
        staff = self.get_by_id(staff_id)
        if not staff:
            return False
        
        self.db.delete(staff)
        self.db.commit()
        return True

    def delete_by_user_id(self, user_id: UUID) -> bool:
        assignments = self.get_by_user_id(user_id)
        if not assignments:
            return False
        
        for assignment in assignments:
            self.db.delete(assignment)
        
        self.db.commit()
        return True
