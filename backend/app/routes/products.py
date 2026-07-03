from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[schemas.ProductResponse])
def get_products(
    category_id: Optional[int] = None,
    category_slug: Optional[str] = None,
    search: Optional[str] = None,
    is_signature: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = None, # "price_asc", "price_desc", "name"
    db: Session = Depends(get_db)
):
    query = db.query(models.Product)
    
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    elif category_slug:
        category = db.query(models.Category).filter(models.Category.slug == category_slug).first()
        if category:
            query = query.filter(models.Product.category_id == category.id)
            
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.Product.name.ilike(search_filter)) | 
            (models.Product.description.ilike(search_filter)) |
            (models.Product.top_notes.ilike(search_filter)) |
            (models.Product.heart_notes.ilike(search_filter)) |
            (models.Product.base_notes.ilike(search_filter))
        )
        
    if is_signature is not None:
        query = query.filter(models.Product.is_signature == is_signature)
        
    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)
        
    if sort_by == "price_asc":
        query = query.order_by(models.Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(models.Product.price.desc())
    elif sort_by == "name":
        query = query.order_by(models.Product.name.asc())
    else:
        query = query.order_by(models.Product.id.desc())
        
    products = query.all()
    
    # Process reviews to set user_name
    for product in products:
        for review in product.reviews:
            review.user_name = review.user.full_name if review.user else "Anonymous"
            
    return products

@router.get("/categories", response_model=List[schemas.CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()

@router.get("/{product_id}", response_model=schemas.ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
        
    # Map user names for the reviews
    for review in product.reviews:
        review.user_name = review.user.full_name if review.user else "Anonymous"
        
    return product

@router.post("/{product_id}/reviews", response_model=schemas.ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    product_id: int,
    review_in: schemas.ReviewCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
        
    # Check if user already reviewed this product
    existing_review = db.query(models.Review).filter(
        models.Review.product_id == product_id,
        models.Review.user_id == current_user.id
    ).first()
    
    if existing_review:
        # Update existing review
        existing_review.rating = review_in.rating
        existing_review.comment = review_in.comment
        db.commit()
        db.refresh(existing_review)
        existing_review.user_name = current_user.full_name
        return existing_review
        
    new_review = models.Review(
        user_id=current_user.id,
        product_id=product_id,
        rating=review_in.rating,
        comment=review_in.comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    new_review.user_name = current_user.full_name
    return new_review
