from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

# User Table: Isme login wale saare bande rahenge
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="Member") # Admin hai ya Member, yahan se check hoga
    
    projects = relationship("Project", back_populates="owner")

# Project Table: Admin jo projects banayega wo yahan save honge
class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id")) # Kaun hai is project ka admin
    
    owner = relationship("User", back_populates="projects")
    tasks = relationship("Task", back_populates="project")

# Task Table: Har project ke andar jo chote-chote kaam honge
class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    status = Column(String, default="Pending") # Member batayega kaam kitna hua
    admin_status = Column(String, default="Pending") # Admin final verify karega
    due_date = Column(DateTime, default=datetime.datetime.utcnow)
    project_id = Column(Integer, ForeignKey("projects.id"))
    assigned_to = Column(Integer, ForeignKey("users.id")) # Kisko kaam diya hai
    
    project = relationship("Project", back_populates="tasks")
    comments = relationship("Comment", back_populates="task")

# Comment Table: Messaging ke liye logic
class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    user_id = Column(Integer, ForeignKey("users.id")) # Kisne message kiya
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    task = relationship("Task", back_populates="comments")
    author = relationship("User")
