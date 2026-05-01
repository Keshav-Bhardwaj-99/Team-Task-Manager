from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
import os
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import database, models

load_dotenv()

# Password ko hash karne ka setup (Bcrypt use ho raha hai)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT ki secret key aur algorithm
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

# Password hash karne wala function
def hash_password(password: str):
    return pwd_context.hash(password)

# Password check karne wala function
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Login ke baad access token banane ke liye logic
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60)))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Token kahan se uthana hai uska setup
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Current user nikalne ke liye function (Security ke liye)
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Bhai pehle login toh kar lo!",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Token decode karke user_id nikal rahe hain
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    # Database se check kar rahe hain ki user hai ya nahi
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user
