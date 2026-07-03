from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/addresses", tags=["Addresses"])

@router.get("", response_model=List[schemas.AddressResponse])
def get_addresses(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Address).filter(models.Address.user_id == current_user.id).all()

@router.post("", response_model=schemas.AddressResponse, status_code=status.HTTP_201_CREATED)
def create_address(
    address_in: schemas.AddressCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # If set to default, make all other user addresses non-default
    if address_in.is_default:
        db.query(models.Address).filter(models.Address.user_id == current_user.id).update(
            {"is_default": False}
        )
        
    new_address = models.Address(
        user_id=current_user.id,
        street=address_in.street,
        city=address_in.city,
        state=address_in.state,
        postal_code=address_in.postal_code,
        country=address_in.country,
        is_default=address_in.is_default
    )
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address

@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(
    address_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    address = db.query(models.Address).filter(
        models.Address.id == address_id,
        models.Address.user_id == current_user.id
    ).first()
    
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )
        
    db.delete(address)
    db.commit()
    return None
