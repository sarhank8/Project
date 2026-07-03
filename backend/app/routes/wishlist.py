from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@router.get("", response_model=List[schemas.WishlistResponse])
def get_wishlist(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(models.WishlistItem).filter(models.WishlistItem.user_id == current_user.id).all()
    # Make sure reviews on nested products have user names
    for item in items:
        for r in item.product.reviews:
            r.user_name = r.user.full_name if r.user else "Anonymous"
    return items

@router.post("", response_model=schemas.WishlistResponse, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    item_in: schemas.WishlistCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Verify product exists
    product = db.query(models.Product).filter(models.Product.id == item_in.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
        
    # Check if already in wishlist
    existing_item = db.query(models.WishlistItem).filter(
        models.WishlistItem.user_id == current_user.id,
        models.WishlistItem.product_id == item_in.product_id
    ).first()
    
    if existing_item:
        for r in existing_item.product.reviews:
            r.user_name = r.user.full_name if r.user else "Anonymous"
        return existing_item
        
    new_item = models.WishlistItem(
        user_id=current_user.id,
        product_id=item_in.product_id
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    for r in new_item.product.reviews:
        r.user_name = r.user.full_name if r.user else "Anonymous"
    return new_item

@router.delete("/{wishlist_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_wishlist_item(
    wishlist_item_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(models.WishlistItem).filter(
        models.WishlistItem.id == wishlist_item_id,
        models.WishlistItem.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist item not found"
        )
        
    db.delete(item)
    db.commit()
    return None
