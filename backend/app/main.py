from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import auth, products, cart, wishlist, orders, admin, addresses, coupons

# Create Database tables on startup (Simple Alembic-less setup for SQLite)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Aab-e-Hayat API",
    description="Luxury Fragrance E-commerce Marketplace Backend",
    version="1.0.0"
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development, we allow all origins. Can be restricted to React dev server port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(cart.router, prefix="/api")
app.include_router(wishlist.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(addresses.router, prefix="/api")
app.include_router(coupons.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to Aab-e-Hayat API. Go to /docs for interactive Swagger UI documentation."}
