from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/coupons", tags=["Coupons"])

@router.get("/validate/{code}", response_model=schemas.CouponResponse)
def validate_coupon(
    code: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    coupon = db.query(models.Coupon).filter(models.Coupon.code == code.upper()).first()
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid coupon code."
        )
        
    if not coupon.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This coupon code is no longer active."
        )
        
    if coupon.expiry_date:
        try:
            exp_date = datetime.strptime(coupon.expiry_date, "%Y-%m-%d")
            if exp_date < datetime.now():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This coupon has expired."
                )
        except ValueError:
            pass
            
    return coupon
