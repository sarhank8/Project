from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/cart", tags=["Shopping Cart"])

@router.get("", response_model=List[schemas.CartItemResponse])
def get_cart(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    cart_items = db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).all()
    # Ensure reviews on nested products have user names populated
    for item in cart_items:
        for r in item.product.reviews:
            r.user_name = r.user.full_name if r.user else "Anonymous"
    return cart_items

@router.post("", response_model=schemas.CartItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    item_in: schemas.CartItemCreate,
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
        
    # Check if item with same product and size already exists in user's cart
    existing_item = db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user.id,
        models.CartItem.product_id == item_in.product_id,
        models.CartItem.size == item_in.size
    ).first()
    
    if existing_item:
        existing_item.quantity += item_in.quantity
        db.commit()
        db.refresh(existing_item)
        for r in existing_item.product.reviews:
            r.user_name = r.user.full_name if r.user else "Anonymous"
        return existing_item
        
    new_item = models.CartItem(
        user_id=current_user.id,
        product_id=item_in.product_id,
        quantity=item_in.quantity,
        size=item_in.size
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    for r in new_item.product.reviews:
        r.user_name = r.user.full_name if r.user else "Anonymous"
    return new_item

@router.put("/{item_id}", response_model=schemas.CartItemResponse)
def update_cart_item(
    item_id: int,
    item_update: schemas.CartItemUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.user_id == current_user.id
    ).first()
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
        
    cart_item.quantity = item_update.quantity
    db.commit()
    db.refresh(cart_item)
    for r in cart_item.product.reviews:
        r.user_name = r.user.full_name if r.user else "Anonymous"
    return cart_item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cart_item(
    item_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.user_id == current_user.id
    ).first()
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
        
    db.delete(cart_item)
    db.commit()
    return None

@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).delete()
    db.commit()
    return None
