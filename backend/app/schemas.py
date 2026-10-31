import re
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, field_validator

# --- Auth Schemas ---
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "customer"

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) <= 8:
            raise ValueError("Password must be more than 8 characters long.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character.")
        return v

class UserLogin(BaseModel):
    email: str
    password: str

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) <= 8:
            raise ValueError("Password must be more than 8 characters long.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character.")
        return v

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime
    class Config:
        from_attributes = True

# --- Products & Variants Schemas ---
class VariantCreate(BaseModel):
    variant_name: str
    attribute_name: str = "Brand"
    attribute_value: str = "Odoo"
    price_extra: float = 560.0

class VariantOut(VariantCreate):
    id: int
    product_id: int
    class Config:
        from_attributes = True

class ProductCreate(BaseModel):
    name: str
    product_type: str = "Software"
    sales_price: float
    cost_price: float
    notes: Optional[str] = None
    variants: Optional[List[VariantCreate]] = []

class ProductOut(BaseModel):
    id: int
    name: str
    product_type: str
    sales_price: float
    cost_price: float
    notes: Optional[str]
    is_active: bool
    variants: List[VariantOut] = []
    class Config:
        from_attributes = True

# --- Plan Schemas ---
class PlanCreate(BaseModel):
    name: str
    cost: float
    billing_frequency: str = "monthly"  # daily, weekly, monthly, yearly
    min_quantity: int = 1
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    auto_close_on_end: bool = True
    allow_early_close: bool = True
    allow_pause: bool = True
    allow_renew: bool = True

class PlanOut(PlanCreate):
    id: int
    class Config:
        from_attributes = True

# --- Tax & Discount Rules ---
class TaxRuleCreate(BaseModel):
    name: str
    rate_percent: float
    is_default: bool = False

class TaxRuleOut(TaxRuleCreate):
    id: int
    class Config:
        from_attributes = True

class DiscountRuleCreate(BaseModel):
    code: str
    name: str
    discount_type: str = "percentage"  # percentage, fixed
    value: float
    min_purchase: float = 0.0
    min_quantity: int = 1
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    max_usage: int = 100
    applies_to_product_id: Optional[int] = None
    is_active: bool = True

class DiscountRuleOut(DiscountRuleCreate):
    id: int
    times_used: int
    class Config:
        from_attributes = True

# --- Quotation Templates ---
class TemplateLineCreate(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    quantity: int = 1
    unit_price: float

class TemplateCreate(BaseModel):
    name: str
    validity_days: int = 30
    plan_id: Optional[int] = None
    notes: Optional[str] = None
    lines: List[TemplateLineCreate] = []

class TemplateLineOut(TemplateLineCreate):
    id: int
    class Config:
        from_attributes = True

class TemplateOut(BaseModel):
    id: int
    name: str
    validity_days: int
    plan_id: Optional[int]
    notes: Optional[str]
    lines: List[TemplateLineOut] = []
    class Config:
        from_attributes = True

# --- Subscription Schemas ---
class SubscriptionLineCreate(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    quantity: int = 1
    unit_price: float
    tax_rate: float = 18.0

class SubscriptionCreate(BaseModel):
    customer_id: int
    plan_id: int
    start_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    payment_terms: str = "Immediate Payment"
    discount_code: Optional[str] = None
    lines: List[SubscriptionLineCreate] = []

class SubscriptionLineOut(BaseModel):
    id: int
    product_id: int
    variant_id: Optional[int]
    quantity: int
    unit_price: float
    tax_rate: float
    amount: float
    class Config:
        from_attributes = True

class SubscriptionOut(BaseModel):
    id: int
    subscription_number: str
    customer_id: int
    plan_id: int
    status: str
    start_date: datetime
    expiry_date: Optional[datetime]
    next_billing_date: datetime
    payment_terms: str
    lines: List[SubscriptionLineOut] = []
    class Config:
        from_attributes = True

# --- Invoices & Payments ---
class InvoiceLineOut(BaseModel):
    id: int
    product_name: str
    variant_name: Optional[str]
    quantity: int
    unit_price: float
    tax_rate: float
    total_amount: float
    class Config:
        from_attributes = True

class PaymentCreate(BaseModel):
    amount: float
    payment_method: str = "Bank Transfer"
    note: Optional[str] = None
    reference_code: Optional[str] = None

class PaymentOut(BaseModel):
    id: int
    invoice_id: int
    amount: float
    payment_method: str
    payment_date: datetime
    note: Optional[str]
    reference_code: Optional[str]
    class Config:
        from_attributes = True

class InvoiceOut(BaseModel):
    id: int
    invoice_number: str
    subscription_id: int
    customer_id: int
    issue_date: datetime
    due_date: datetime
    status: str
    subtotal: float
    tax_amount: float
    discount_amount: float
    total_amount: float
    lines: List[InvoiceLineOut] = []
    payments: List[PaymentOut] = []
    class Config:
        from_attributes = True
