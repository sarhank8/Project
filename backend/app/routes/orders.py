import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("", response_model=List[schemas.OrderResponse])
def get_orders(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    orders = db.query(models.Order).filter(models.Order.user_id == current_user.id).order_by(models.Order.id.desc()).all()
    # Map product name in order items for convenience
    for o in orders:
        for item in o.items:
            item.product_name = item.product.name if item.product else "Unknown Product"
    return orders

@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(
    order_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    for item in order.items:
        item.product_name = item.product.name if item.product else "Unknown Product"
        
    return order

@router.post("", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(
    order_in: schemas.OrderCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch user's cart items
    cart_items = db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).all()
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your cart is empty."
        )
        
    # Verify address exists and belongs to user
    address = db.query(models.Address).filter(
        models.Address.id == order_in.address_id,
        models.Address.user_id == current_user.id
    ).first()
    if not address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid shipping address."
        )
        
    # Calculate initial subtotal
    subtotal = 0.0
    for item in cart_items:
        # Check stock
        if item.product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {item.product.name} is out of stock or does not have enough quantity."
            )
            
        # Adjust price based on size
        # 3ml: -30%, 6ml: base price, 12ml: +60%
        item_price = item.product.price
        if item.size == "3ml":
            item_price = item_price * 0.7
        elif item.size == "12ml":
            item_price = item_price * 1.6
            
        subtotal += item_price * item.quantity
        
    # Handle coupon discount
    discount_percentage = 0
    if order_in.coupon_code:
        coupon = db.query(models.Coupon).filter(
            models.Coupon.code == order_in.coupon_code.upper(),
            models.Coupon.is_active == True
        ).first()
        
        if coupon:
            # Check expiry
            is_valid = True
            if coupon.expiry_date:
                try:
                    exp_date = datetime.strptime(coupon.expiry_date, "%Y-%m-%d")
                    if exp_date < datetime.now():
                        is_valid = False
                except ValueError:
                    pass
            if is_valid:
                discount_percentage = coupon.discount_percentage
                
    discount_amount = subtotal * (discount_percentage / 100.0)
    total_amount = subtotal - discount_amount
    
    # Generate tracking number
    tracking_num = "TRK-" + str(uuid.uuid4())[:8].upper()
    
    # Create the Order
    new_order = models.Order(
        user_id=current_user.id,
        status="Pending",
        total_amount=round(total_amount, 2),
        address_id=address.id,
        tracking_number=tracking_num,
        coupon_code=order_in.coupon_code.upper() if order_in.coupon_code else None
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # Create Order Items and update product stock
    for item in cart_items:
        item_price = item.product.price
        if item.size == "3ml":
            item_price = item_price * 0.7
        elif item.size == "12ml":
            item_price = item_price * 1.6
            
        order_item = models.OrderItem(
            order_id=new_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=round(item_price, 2),
            size=item.size
        )
        db.add(order_item)
        
        # Decrement product stock
        item.product.stock -= item.quantity
        
    # Clear cart
    db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).delete()
    db.commit()
    db.refresh(new_order)
    
    for item in new_order.items:
        item.product_name = item.product.name if item.product else "Unknown Product"
        
    return new_order
