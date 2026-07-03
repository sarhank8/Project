import sys
import os

# Add parent directory to sys.path so we can import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app import models, auth

def seed_database():
    # Make sure tables are created
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if database is already seeded
        if db.query(models.User).count() > 0:
            print("Database already seeded. Skipping...")
            return
            
        print("Seeding database...")
        
        # 1. Create Default Users
        admin_user = models.User(
            email="admin@aabehayat.com",
            full_name="Abdul Ahad Saiyed",
            hashed_password=auth.get_password_hash("AdminPassword123"),
            is_admin=True
        )
        customer_user = models.User(
            email="customer@aabehayat.com",
            full_name="Scent Enthusiast",
            hashed_password=auth.get_password_hash("CustomerPassword123"),
            is_admin=False
        )
        db.add(admin_user)
        db.add(customer_user)
        db.commit()
        db.refresh(admin_user)
        db.refresh(customer_user)
        
        # Add a default address for the customer
        default_address = models.Address(
            user_id=customer_user.id,
            street="123 Perfume Lane, Fragrance District",
            city="Mumbai",
            state="Maharashtra",
            postal_code="400001",
            country="India",
            is_default=True
        )
        db.add(default_address)
        db.commit()
        
        # 2. Create Categories
        categories = {
            "Oud": models.Category(name="Oud Collection", description="Rich, dark, and prestigious Agarwood formulations.", slug="oud"),
            "Rose": models.Category(name="Rose Collection", description="Elegant formulations of natural Damask Rose and floral pairings.", slug="rose"),
            "Sandalwood": models.Category(name="Sandalwood", description="Warm, creamy, and grounding Mysore Sandalwood extracts.", slug="sandalwood"),
            "Mitti": models.Category(name="Mitti Attar", description="Grounding petrichor capturing the scent of first rain on dry earth.", slug="mitti"),
            "Musk": models.Category(name="Musk Collection", description="Clean, powdery, and long-lasting animalic and white musks.", slug="musk"),
            "Jasmine": models.Category(name="Jasmine Collection", description="Exquisite, uplifting blends of night-blooming jasmine flowers.", slug="jasmine"),
            "Premium Blends": models.Category(name="Premium Blends", description="Artisanal fragrances mixing rare resins, woods, and spices.", slug="premium-blends")
        }
        
        for cat in categories.values():
            db.add(cat)
        db.commit()
        
        # Refresh categories to get IDs
        for key in categories.keys():
            db.refresh(categories[key])
            
        # 3. Create Products
        products = [
            models.Product(
                name="Mitti Attar",
                description="A uniquely grounding and nostalgic fragrance, captured by hydro-distillation of baked clay into a sandalwood base. It perfectly evokes the scent of the first monsoon rain on parched soil.",
                price=55.0,
                stock=15,
                category_id=categories["Mitti"].id,
                image_url="https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=600&auto=format&fit=crop",
                top_notes="Baked Clay, Rainwater",
                heart_notes="Wet Earth, Silt",
                base_notes="Sandalwood oil",
                is_signature=False
            ),
            models.Product(
                name="The Royal Amber",
                description="A mesmerizing, warm, and inviting signature attar with notes of premium Madagascar Vanilla, sweet Labdanum resin, and pure aged Dehnal Oud. Presented in a hand-cut crystal bottle.",
                price=120.0,
                stock=8,
                category_id=categories["Premium Blends"].id,
                image_url="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop",
                top_notes="Saffron, Bergamot, Cardamom",
                heart_notes="Labdanum, Madagascar Vanilla, Rose",
                base_notes="Dehnal Oud, Ambergris, Patchouli",
                is_signature=True
            ),
            models.Product(
                name="Gulab & Motia",
                description="A classic, intense floral harmony bringing together the rich, velvety sweetness of Damask Rose (Gulab) and the crisp, uplifting purity of night-blooming Arabian Jasmine (Motia).",
                price=45.0,
                stock=20,
                category_id=categories["Rose"].id,
                image_url="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop",
                top_notes="Damask Rose, Fresh Jasmine",
                heart_notes="Geranium, Violet Leaves",
                base_notes="Light White Musk",
                is_signature=False
            ),
            models.Product(
                name="Sandal & Oud Reserve",
                description="A deep, timeless masculine fragrance featuring a rich, smoky base of aged Mysore Sandalwood and exotic Indian Agarwood (Oud). The quintessential scent of warmth, status, and longevity.",
                price=85.0,
                stock=12,
                category_id=categories["Oud"].id,
                image_url="https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=600&auto=format&fit=crop",
                top_notes="Incense, Saffron",
                heart_notes="Turkish Rose, Aged Oud",
                base_notes="Mysore Sandalwood, Cedarwood, Vetiver",
                is_signature=False
            ),
            models.Product(
                name="White Musk Supreme",
                description="Clean, soft, and powdery musk blended with elegant white floral highlights. This attar offers a subtle, comforting fragrance profile that sits close to the skin and lasts all day.",
                price=38.0,
                stock=25,
                category_id=categories["Musk"].id,
                image_url="https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&auto=format&fit=crop",
                top_notes="Lily of the Valley, Aldehydes",
                heart_notes="White Rose, Powdery Accord",
                base_notes="Clean White Musk, Sandalwood",
                is_signature=False
            ),
            models.Product(
                name="Jasmine Gold",
                description="Exquisite night-blooming jasmine petals blended with a touch of precious saffron and light citrus notes, resting on a smooth, warm amber and musk base.",
                price=42.0,
                stock=18,
                category_id=categories["Jasmine"].id,
                image_url="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600&auto=format&fit=crop",
                top_notes="Neroli, Lemon Zest, Saffron",
                heart_notes="Grandiflorum Jasmine, Orange Blossom",
                base_notes="Amber, White Musk",
                is_signature=False
            ),
            models.Product(
                name="Royal Oudh Al-Malik",
                description="The King of Ouds. Crafted from rare Cambodian Oudh, rich natural Ambergris, and spicy Cardamom. A bold, majestic scent that represents the pinnacle of Arabian perfumery.",
                price=160.0,
                stock=4,
                category_id=categories["Oud"].id,
                image_url="https://images.unsplash.com/photo-1588405748373-122b2321bc31?q=80&w=600&auto=format&fit=crop",
                top_notes="Cardamom, Pink Pepper",
                heart_notes="Cambodian Oud, Cedarwood",
                base_notes="Ambergris, Leather, Dark Musk, Tobacco",
                is_signature=True
            ),
            models.Product(
                name="Sandalwood Mysore Oud",
                description="A magnificent layering of double-distilled grounding Mitti and precious, creamy Mysore Sandalwood base, combined with a subtle undertone of light white oud. Calming and luxurious.",
                price=70.0,
                stock=10,
                category_id=categories["Sandalwood"].id,
                image_url="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop",
                top_notes="Bergamot, Cardamom",
                heart_notes="Sandalwood Cream, Baked Earth",
                base_notes="White Oud, Amber, Vanilla",
                is_signature=False
            )
        ]
        
        for prod in products:
            db.add(prod)
        db.commit()
        
        # 4. Create Reviews
        db.refresh(products[0]) # Mitti Attar
        db.refresh(products[1]) # Royal Amber
        
        reviews = [
            models.Review(
                user_id=customer_user.id,
                product_id=products[0].id,
                rating=5,
                comment="Absolutely magical! It literally smells like dry earth getting wet in the first rain. The petrichor is beautifully captured. Highly recommend!"
            ),
            models.Review(
                user_id=customer_user.id,
                product_id=products[1].id,
                rating=5,
                comment="A true masterpiece. The vanilla and amber blend perfectly with the oud. It is warm, luxurious, and I get compliments every single time I wear it."
            ),
            models.Review(
                user_id=customer_user.id,
                product_id=products[3].id,
                rating=4,
                comment="Very strong woody fragrance. The sandalwood notes settle down nicely after an hour, leaving a pleasant sweet woody trace."
            )
        ]
        
        for rev in reviews:
            db.add(rev)
            
        # 5. Create Coupons
        coupons = [
            models.Coupon(code="WELCOME10", discount_percentage=10, is_active=True),
            models.Coupon(code="LUXURY20", discount_percentage=20, is_active=True),
            models.Coupon(code="EIDMUBARAK", discount_percentage=15, is_active=True)
        ]
        for coup in coupons:
            db.add(coup)
            
        db.commit()
        print("Database seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
