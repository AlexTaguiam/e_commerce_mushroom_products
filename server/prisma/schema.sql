-- Enable UUID extension if you decide to use it for IDs later (optional, but good practice)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. USERS TABLE
-- ==============================================================================
CREATE TABLE users (
    firebase_uid VARCHAR(128) PRIMARY KEY, -- Primary key provided by Firebase Auth client
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'customer', -- Validated via constants/enums.js in Express
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 2. PRODUCTS TABLE
-- ==============================================================================
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL, -- Safeguards exact monetary values (never use FLOAT)
    image_url TEXT,                -- Handled via Cloudinary asset URLs
    stock_quantity INT NOT NULL DEFAULT 0, -- Single source of truth for stock
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active' or 'inactive'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 3. ORDERS TABLE
-- ==============================================================================
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL REFERENCES users(firebase_uid) ON DELETE RESTRICT,
    fulfillment_type VARCHAR(50) NOT NULL,    -- 'pickup' or 'delivery'
    delivery_address TEXT,                     -- NULL if pickup
    payment_method VARCHAR(50) NOT NULL,      -- 'cod' or 'paymongo'
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed'
    status VARCHAR(50) NOT NULL DEFAULT 'pending',         -- 'pending', 'confirmed', 'ready', 'out_for_delivery', 'completed', 'cancelled'
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 4. ORDER ITEMS (Line Items Breakdown)
-- ==============================================================================
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
    quantity INT NOT NULL,
    price_at_order DECIMAL(10, 2) NOT NULL -- Snapshots the price at checkout to preserve financial history
);

-- ==============================================================================
-- 5. PAYMENTS TABLE
-- ==============================================================================
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL UNIQUE REFERENCES orders(order_id) ON DELETE RESTRICT,
    method VARCHAR(50) NOT NULL,          -- 'cod' or 'paymongo'
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    transaction_ref TEXT,                 -- Stores PayMongo's payment_intent_id or source_id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 6. INVENTORY LOGS (Audit Trail)
-- ==============================================================================
CREATE TABLE inventory_logs (
    log_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
    change_quantity INT NOT NULL,         -- Can be positive (stock_in) or negative (order_deduction)
    log_type VARCHAR(50) NOT NULL,        -- 'stock_in', 'order_deduction', 'adjustment'
    reason TEXT,                          -- Required for manual adjustments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);