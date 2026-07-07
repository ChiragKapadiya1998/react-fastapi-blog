from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional

from . import models, schemas, auth, database
from .database import engine, get_db

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="React Blog API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://react-fastapi-blog.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Auth Routes ---

@app.post("/auth/signup", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/auth/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = auth.timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.put("/users/me", response_model=schemas.UserResponse)
def update_user_me(user_update: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if user_update.first_name is not None:
        current_user.first_name = user_update.first_name
    if user_update.last_name is not None:
        current_user.last_name = user_update.last_name
    db.commit()
    db.refresh(current_user)
    return current_user
def get_profile_response(user: models.User, current_user: Optional[models.User] = None):
    return schemas.ProfileResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        post_count=len(user.posts),
        followers_count=len(user.followers),
        following_count=len(user.following),
        is_following=current_user in user.followers if current_user else False
    )

@app.get("/users/{user_id}", response_model=schemas.ProfileResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return get_profile_response(user, current_user)

@app.post("/users/{user_id}/follow")
def follow_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    user_to_follow = db.query(models.User).filter(models.User.id == user_id).first()
    if not user_to_follow:
        raise HTTPException(status_code=404, detail="User not found")
    if user_to_follow.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
        
    # Check if already following
    is_following = any(f.id == current_user.id for f in user_to_follow.followers)
    if not is_following:
        user_to_follow.followers.append(current_user)
        db.commit()
    return {"ok": True}

@app.delete("/users/{user_id}/follow")
def unfollow_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    user_to_unfollow = db.query(models.User).filter(models.User.id == user_id).first()
    if not user_to_unfollow:
        raise HTTPException(status_code=404, detail="User not found")
        
    follower_to_remove = next((f for f in user_to_unfollow.followers if f.id == current_user.id), None)
    if follower_to_remove:
        user_to_unfollow.followers.remove(follower_to_remove)
        db.commit()
    return {"ok": True}

@app.get("/users/{user_id}/followers", response_model=List[schemas.ProfileResponse])
def get_user_followers(user_id: int, db: Session = Depends(get_db), current_user: Optional[models.User] = Depends(auth.get_optional_current_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return [get_profile_response(follower, current_user) for follower in user.followers]

@app.get("/users/{user_id}/following", response_model=List[schemas.ProfileResponse])
def get_user_following(user_id: int, db: Session = Depends(get_db), current_user: Optional[models.User] = Depends(auth.get_optional_current_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return [get_profile_response(followed, current_user) for followed in user.following]


# --- Post Routes ---

@app.get("/posts", response_model=List[schemas.PostResponse])
def get_posts(skip: int = 0, limit: int = 100, user_id: Optional[int] = None, db: Session = Depends(get_db), current_user: Optional[models.User] = Depends(auth.get_optional_current_user)):
    query = db.query(models.Post)
    if user_id is not None:
        query = query.filter(models.Post.user_id == user_id)
    posts = query.order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()
    
    if current_user:
        following_ids = {u.id for u in current_user.following}
        for post in posts:
            post.author.is_following = post.author.id in following_ids
            
    return posts

@app.get("/posts/{post_id}", response_model=schemas.PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db), current_user: Optional[models.User] = Depends(auth.get_optional_current_user)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    if current_user:
        post.author.is_following = any(u.id == post.author.id for u in current_user.following)
        
    return post

@app.post("/posts", response_model=schemas.PostResponse)
def create_post(post: schemas.PostCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_post = models.Post(**post.model_dump(), user_id=current_user.id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@app.put("/posts/{post_id}", response_model=schemas.PostResponse)
def update_post(post_id: int, post: schemas.PostCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    if db_post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
    
    db_post.title = post.title
    db_post.content = post.content
    db.commit()
    db.refresh(db_post)
    return db_post

@app.delete("/posts/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    if db_post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    db.delete(db_post)
    db.commit()
    return {"ok": True}


# --- Comment Routes ---

@app.get("/comments/{post_id}", response_model=List[schemas.CommentResponse])
def get_comments(post_id: int, db: Session = Depends(get_db)):
    comments = db.query(models.Comment).filter(models.Comment.post_id == post_id).order_by(models.Comment.created_at.asc()).all()
    return comments

@app.post("/comments", response_model=schemas.CommentResponse)
def create_comment(comment: schemas.CommentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Verify post exists
    post = db.query(models.Post).filter(models.Post.id == comment.post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    db_comment = models.Comment(**comment.model_dump(), user_id=current_user.id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@app.delete("/comments/{comment_id}")
def delete_comment(comment_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if db_comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    db.delete(db_comment)
    db.commit()
    return {"ok": True}
