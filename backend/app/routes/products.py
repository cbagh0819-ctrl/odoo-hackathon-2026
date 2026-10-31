from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Product, ProductVariant, User
from ..schemas import ProductCreate, ProductOut, VariantCreate, VariantOut
from ..auth import require_role

router = APIRouter(prefix="/api/products", tags=["Products & Variants"])

@router.get("", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db)):
    return db.query(Product).filter(Product.is_active == True).all()

@router.post("", response_model=ProductOut)
def create_product(
    prod_in: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    """Admin sets up products with name, type, sales price, cost price, notes, and variants."""
    product = Product(
        name=prod_in.name,
        product_type=prod_in.product_type,
        sales_price=prod_in.sales_price,
        cost_price=prod_in.cost_price,
        notes=prod_in.notes
    )
    db.add(product)
    db.flush()

    for v in prod_in.variants or []:
        variant = ProductVariant(
            product_id=product.id,
            variant_name=v.variant_name,
            attribute_name=v.attribute_name,
            attribute_value=v.attribute_value,
            price_extra=v.price_extra
        )
        db.add(variant)

    db.commit()
    db.refresh(product)
    return product

@router.post("/{product_id}/variants", response_model=VariantOut)
def add_product_variant(
    product_id: int,
    variant_in: VariantCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    variant = ProductVariant(
        product_id=product_id,
        variant_name=variant_in.variant_name,
        attribute_name=variant_in.attribute_name,
        attribute_value=variant_in.attribute_value,
        price_extra=variant_in.price_extra
    )
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return variant

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    db.commit()
    return {"message": "Product deactivated successfully"}
