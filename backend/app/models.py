import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="customer")  # admin, staff, customer
    reset_token = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    subscriptions = relationship("Subscription", back_populates="customer")
    invoices = relationship("Invoice", back_populates="customer")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    product_type = Column(String(50), default="Software")  # Software, Service, Add-on
    sales_price = Column(Float, nullable=False, default=0.0)
    cost_price = Column(Float, nullable=False, default=0.0)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    variant_name = Column(String(100), nullable=False)  # e.g., "Brand: Odoo" or "Tier: Enterprise"
    attribute_name = Column(String(50), default="Brand")
    attribute_value = Column(String(50), default="Odoo")
    price_extra = Column(Float, default=560.0)  # e.g. Odoo brand adds 560

    product = relationship("Product", back_populates="variants")


class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    cost = Column(Float, nullable=False, default=0.0)
    billing_frequency = Column(String(20), default="monthly")  # daily, weekly, monthly, yearly
    min_quantity = Column(Integer, default=1)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    
    # Plan lifecycle rules decided by Admin
    auto_close_on_end = Column(Boolean, default=True)
    allow_early_close = Column(Boolean, default=True)
    allow_pause = Column(Boolean, default=True)
    allow_renew = Column(Boolean, default=True)

    subscriptions = relationship("Subscription", back_populates="plan")


class TaxRule(Base):
    __tablename__ = "tax_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # e.g. "Standard GST 18%", "VAT 10%"
    rate_percent = Column(Float, nullable=False, default=18.0)
    is_default = Column(Boolean, default=False)


class DiscountRule(Base):
    __tablename__ = "discount_rules"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    discount_type = Column(String(20), default="percentage")  # percentage, fixed
    value = Column(Float, nullable=False)  # e.g. 10 (%) or 100 ($/₹)
    min_purchase = Column(Float, default=0.0)
    min_quantity = Column(Integer, default=1)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    max_usage = Column(Integer, default=100)
    times_used = Column(Integer, default=0)
    applies_to_product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    is_active = Column(Boolean, default=True)


class QuotationTemplate(Base):
    __tablename__ = "quotation_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    validity_days = Column(Integer, default=30)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=True)
    notes = Column(Text, nullable=True)

    lines = relationship("QuotationTemplateLine", back_populates="template", cascade="all, delete-orphan")


class QuotationTemplateLine(Base):
    __tablename__ = "quotation_template_lines"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("quotation_templates.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, default=0.0)

    template = relationship("QuotationTemplate", back_populates="lines")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    subscription_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False)
    
    # Pipeline: Draft -> Quotation -> Confirmed -> Active -> Paused -> Closed
    status = Column(String(30), default="Draft", index=True)
    start_date = Column(DateTime, default=datetime.datetime.utcnow)
    expiry_date = Column(DateTime, nullable=True)
    next_billing_date = Column(DateTime, nullable=False)
    payment_terms = Column(String(50), default="Immediate Payment")
    
    discount_rule_id = Column(Integer, ForeignKey("discount_rules.id"), nullable=True)

    customer = relationship("User", back_populates="subscriptions")
    plan = relationship("Plan", back_populates="subscriptions")
    discount = relationship("DiscountRule")
    lines = relationship("SubscriptionLine", back_populates="subscription", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="subscription")


class SubscriptionLine(Base):
    __tablename__ = "subscription_lines"

    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, default=0.0)
    tax_rate = Column(Float, default=18.0)
    amount = Column(Float, default=0.0)

    subscription = relationship("Subscription", back_populates="lines")
    product = relationship("Product")
    variant = relationship("ProductVariant")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), unique=True, index=True, nullable=False)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    issue_date = Column(DateTime, default=datetime.datetime.utcnow)
    due_date = Column(DateTime, nullable=False)
    
    # State: Draft -> Confirmed -> Paid (or Canceled)
    status = Column(String(30), default="Draft", index=True)
    
    subtotal = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)

    subscription = relationship("Subscription", back_populates="invoices")
    customer = relationship("User", back_populates="invoices")
    lines = relationship("InvoiceLine", back_populates="invoice", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="invoice")


class InvoiceLine(Base):
    __tablename__ = "invoice_lines"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    product_name = Column(String(150), nullable=False)
    variant_name = Column(String(100), nullable=True)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, default=0.0)
    tax_rate = Column(Float, default=18.0)
    total_amount = Column(Float, default=0.0)

    invoice = relationship("Invoice", back_populates="lines")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), default="Bank Transfer")  # Bank Transfer, Credit Card, UPI, Cash
    payment_date = Column(DateTime, default=datetime.datetime.utcnow)
    note = Column(Text, nullable=True)
    reference_code = Column(String(100), nullable=True)

    invoice = relationship("Invoice", back_populates="payments")
