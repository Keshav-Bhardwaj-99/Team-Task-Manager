import schemas, auth
from fastapi import HTTPException, status, FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine, get_db
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import text

# Database table banane ke liye logic
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Root route taaki pata chale backend chal raha hai
@app.get("/")
def home():
    return {"message": "Bhai backend ekdum mast chal raha hai Railway par!"}

# CORS Settings: Sabse zaroori cheez frontend connect karne ke liye
# Humne origins mein "*" rakha hai aur headers ko ekdum open rakha hai
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Login user ki details nikalne ke liye
@app.get("/users/me", response_model=schemas.UserOut)
def get_current_user_info(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# Naya user banane ke liye (Signup)
@app.post("/signup", response_model=schemas.UserOut)
def signup(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Bhai ye email pehle se hai!")

    hashed_password = auth.hash_password(user_data.password)
    new_user = models.User(name=user_data.name, email=user_data.email, password=hashed_password, role=user_data.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Login logic
@app.post("/login")
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Bhai email galat hai!")

    if not auth.verify_password(user_credentials.password, user.password):
        raise HTTPException(status_code=401, detail="Password galat hai!")

    access_token = auth.create_access_token(data={"user_id": user.id, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

# Baaki saare routes...
@app.get("/users", response_model=list[schemas.UserOut])
def get_users(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.User).all()

@app.post("/projects", response_model=schemas.ProjectOut)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Sirf Admin hi project bana sakta hai!")
    new_project = models.Project(**project.model_dump(), owner_id=current_user.id)
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@app.get("/projects", response_model=list[schemas.ProjectOut])
def get_all_projects(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Project).all()

@app.post("/tasks", response_model=schemas.TaskOut)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == task.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project nahi mila!")
    new_task = models.Task(**task.model_dump())
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@app.get("/my-tasks", response_model=list[schemas.TaskOut])
def get_my_tasks(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role == "Admin":
        tasks = db.query(models.Task).all()
    else:
        tasks = db.query(models.Task).filter(models.Task.assigned_to == current_user.id).all()
    
    results = []
    for t in tasks:
        project = db.query(models.Project).filter(models.Project.id == t.project_id).first()
        owner = db.query(models.User).filter(models.User.id == project.owner_id).first() if project else None
        member = db.query(models.User).filter(models.User.id == t.assigned_to).first()
        task_data = schemas.TaskOut.model_validate(t)
        task_data.owner_name = owner.name if owner else "Admin"
        task_data.assigned_name = member.name if member else "Member"
        task_data.project_name = project.name if project else "Project"
        comments_with_names = []
        for c in t.comments:
            author = db.query(models.User).filter(models.User.id == c.user_id).first()
            comment_data = schemas.CommentOut.model_validate(c)
            comment_data.author_name = author.name if author else "User"
            comments_with_names.append(comment_data)
        task_data.comments = comments_with_names
        results.append(task_data)
    return results

@app.patch("/tasks/{task_id}", response_model=schemas.TaskOut)
def update_task_status(task_id: int, task_update: schemas.TaskStatusUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task nahi mila!")
    if current_user.role == "Admin":
        if task_update.admin_status: task.admin_status = task_update.admin_status
    elif current_user.id == task.assigned_to:
        if task_update.status: task.status = task_update.status
    db.commit()
    db.refresh(task)
    return task

@app.post("/tasks/{task_id}/comments", response_model=schemas.CommentOut)
def add_comment(task_id: int, comment: schemas.CommentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    new_comment = models.Comment(content=comment.content, task_id=task_id, user_id=current_user.id)
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    res = schemas.CommentOut.model_validate(new_comment)
    res.author_name = current_user.name
    return res

@app.get("/dashboard-stats")
def get_stats(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    total_projects = db.query(models.Project).count()
    total_tasks = db.query(models.Task).count()
    completed_tasks = db.query(models.Task).filter(models.Task.admin_status == "Completed").count()
    pending_tasks = total_tasks - completed_tasks
    return {
        "total_projects": total_projects,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks
    }
