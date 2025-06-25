from database import SessionLocal, engine
from models import Base, User, RoleEnum
from auth import get_password_hash

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Clear existing users (for idempotency in dev)
db.query(User).delete()
db.commit()

# Create a manager
manager = User(
    name="Alice Manager",
    email="manager@example.com",
    password_hash=get_password_hash("managerpass"),
    role=RoleEnum.manager
)
db.add(manager)
db.commit()
db.refresh(manager)

# Create employees
employee1 = User(
    name="Bob Employee",
    email="bob@example.com",
    password_hash=get_password_hash("bobpass"),
    role=RoleEnum.employee,
    manager_id=manager.id
)
employee2 = User(
    name="Carol Employee",
    email="carol@example.com",
    password_hash=get_password_hash("carolpass"),
    role=RoleEnum.employee,
    manager_id=manager.id
)
db.add_all([employee1, employee2])
db.commit()

db.close()
print("Seeded database with 1 manager and 2 employees.") 