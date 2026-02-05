from infrastructure.database.db import engine
from infrastructure.database.base import Base
import domain.entities

def create_tables():
    Base.metadata.create_all(bind=engine)