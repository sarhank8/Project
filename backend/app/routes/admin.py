from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

@router.get("/dashboard", response_model=Dict[str, Any])
def get_dashboard_stats(
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    # Total Users
    total_customers = db.query(models.User).filter(models.User.is_admin == False).count()
    
    # Total Orders and Revenue
    orders = db.query(models.Order).all()
    total_orders = len(orders)
    total_revenue = sum(o.total_amount for o in orders if o.status != "Cancelled")
    
    # Low stock items
    low_stock_products = db.query(models.Product).filter(models.Product.stock < 5).all()
    low_stock_list = []
    for p in low_stock_products:
        low_stock_list.append({
            "id": p.id,
            "name": p.name,
            "stock": p.stock,
            "price": p.price
        })
        
    # Product count
    total_products = db.query(models.Product).count()
    
    # Category count
    total_categories = db.query(models.Category).count()
    
    # Recent orders
    recent_orders_query = db.query(models.Order).order_by(models.Order.id.desc()).limit(5).all()
    recent_orders = []
    for o in recent_orders_query:
        recent_orders.append({
            "id": o.id,
            "customer_name": o.user.full_name,
            "status": o.status,
            "total_amount": o.total_amount,
            "created_at": o.created_at
        })

    return {
        "total_customers": total_customers,
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "total_products": total_products,
        "total_categories": total_categories,
        "low_stock_products": low_stock_list,
        "recent_orders": recent_orders
    }

# PRODUCT MANAGEMENT
@router.post("/products", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: schemas.ProductCreate,
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(models.Product).filter(models.Product.name == product_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product with this name already exists.")
        
    new_product = models.Product(**product_in.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.put("/products/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    product_in: schemas.ProductCreate,
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    for key, value in product_in.dict().items():
        setattr(product, key, value)
        
    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    db.delete(product)
    db.commit()
    return None

# CATEGORY MANAGEMENT
@router.post("/categories", response_model=schemas.CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: schemas.CategoryCreate,
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(models.Category).filter(models.Category.name == category_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists.")
        
    new_cat = models.Category(**category_in.dict())
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat

@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    cat = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
        
    db.delete(cat)
    db.commit()
    return None

# ORDER MANAGEMENT
@router.get("/orders", response_model=List[schemas.OrderResponse])
def get_all_orders(
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    orders = db.query(models.Order).order_by(models.Order.id.desc()).all()
    for o in orders:
        for item in o.items:
            item.product_name = item.product.name if item.product else "Unknown Product"
    return orders

@router.put("/orders/{order_id}", response_model=schemas.OrderResponse)
def update_order_status(
    order_id: int,
    status_update: schemas.OrderStatusUpdate,
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = status_update.status
    if status_update.tracking_number:
        order.tracking_number = status_update.tracking_number
        
    db.commit()
    db.refresh(order)
    for item in order.items:
        item.product_name = item.product.name if item.product else "Unknown Product"
    return order

# COUPON MANAGEMENT
@router.get("/coupons", response_model=List[schemas.CouponResponse])
def get_all_coupons(
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(models.Coupon).all()

@router.post("/coupons", response_model=schemas.CouponResponse, status_code=status.HTTP_201_CREATED)
def create_coupon(
    coupon_in: schemas.CouponCreate,
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(models.Coupon).filter(models.Coupon.code == coupon_in.code.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists.")
        
    new_coupon = models.Coupon(
        code=coupon_in.code.upper(),
        discount_percentage=coupon_in.discount_percentage,
        is_active=coupon_in.is_active,
        expiry_date=coupon_in.expiry_date
    )
    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    return new_coupon

@router.delete("/coupons/{coupon_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_coupon(
    coupon_id: int,
    admin: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    coupon = db.query(models.Coupon).filter(models.Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
        
    db.delete(coupon)
    db.commit()
    return None
