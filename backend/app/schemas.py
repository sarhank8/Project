from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Address Schemas
class AddressCreate(BaseModel):
    street: str
    city: str
    state: str
    postal_code: str
    country: str = "India"
    is_default: bool = False

class AddressResponse(AddressCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Category Schemas
class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    slug: str

class CategoryResponse(CategoryCreate):
    id: int

    class Config:
        from_attributes = True

# Review Schemas
class ReviewCreate(BaseModel):
    product_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    user_name: Optional[str] = None # Added for display

    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    top_notes: Optional[str] = None
    heart_notes: Optional[str] = None
    base_notes: Optional[str] = None
    is_signature: bool = False

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    reviews: List[ReviewResponse] = []

    class Config:
        from_attributes = True

# Cart Schemas
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(1, ge=1)
    size: str = "6ml"

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)

class CartItemResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    quantity: int
    size: str
    product: ProductResponse

    class Config:
        from_attributes = True

# Wishlist Schemas
class WishlistCreate(BaseModel):
    product_id: int

class WishlistResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    product: ProductResponse

    class Config:
        from_attributes = True

# Order Item Schemas
class OrderItemResponse(BaseModel):
    id: int
    product_id: Optional[int] = None
    quantity: int
    price: float
    size: str
    product_name: Optional[str] = None # Added for easier display

    class Config:
        from_attributes = True

# Order Schemas
class OrderCreate(BaseModel):
    address_id: int
    coupon_code: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    user_id: int
    status: str
    total_amount: float
    address_id: Optional[int] = None
    tracking_number: Optional[str] = None
    coupon_code: Optional[str] = None
    created_at: datetime
    items: List[OrderItemResponse] = []
    address: Optional[AddressResponse] = None

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str
    tracking_number: Optional[str] = None

# Coupon Schemas
class CouponCreate(BaseModel):
    code: str
    discount_percentage: int = Field(..., ge=1, le=100)
    is_active: bool = True
    expiry_date: Optional[str] = None

class CouponResponse(CouponCreate):
    id: int

    class Config:
        from_attributes = True
