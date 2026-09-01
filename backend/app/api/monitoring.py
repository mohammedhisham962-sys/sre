from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.Monitor])
def read_monitors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Monitor).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.Monitor)
def create_monitor(monitor: schemas.MonitorCreate, db: Session = Depends(get_db)):
    db_monitor = models.Monitor(**monitor.model_dump())
    db.add(db_monitor)
    db.commit()
    db.refresh(db_monitor)
    return db_monitor
