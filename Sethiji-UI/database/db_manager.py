import os
import json
import logging
import time
from datetime import datetime

logger = logging.getLogger(__name__)

# Database paths
DATABASE_DIR = "database"
INVENTORY_FILE = os.path.join(DATABASE_DIR, "inventory.json")
CUSTOMERS_FILE = os.path.join(DATABASE_DIR, "customers.json")
SUPPLIERS_FILE = os.path.join(DATABASE_DIR, "suppliers.json")
ORDERS_FILE = os.path.join(DATABASE_DIR, "orders.json")

def init_database():
    """Initialize the database files if they don't exist"""
    # Create database directory if it doesn't exist
    if not os.path.exists(DATABASE_DIR):
        os.makedirs(DATABASE_DIR)
    
    # Create inventory.json if it doesn't exist
    if not os.path.exists(INVENTORY_FILE):
        with open(INVENTORY_FILE, 'w') as f:
            json.dump({"items": []}, f)
    
    # Create customers.json if it doesn't exist
    if not os.path.exists(CUSTOMERS_FILE):
        with open(CUSTOMERS_FILE, 'w') as f:
            json.dump({"customers": []}, f)
    
    # Create suppliers.json if it doesn't exist
    if not os.path.exists(SUPPLIERS_FILE):
        with open(SUPPLIERS_FILE, 'w') as f:
            json.dump({"suppliers": []}, f)
    
    # Create orders.json if it doesn't exist
    if not os.path.exists(ORDERS_FILE):
        with open(ORDERS_FILE, 'w') as f:
            json.dump({"customer_orders": [], "supplier_orders": []}, f)
    
    # Initialize with sample data if files are empty
    _init_sample_data()
    
    logger.info("Database initialized")

def _init_sample_data():
    """Initialize database with sample data if empty"""
    # Check if inventory is empty
    inventory = _read_json_file(INVENTORY_FILE)
    if not inventory.get("items"):
        # Add sample inventory items
        inventory["items"] = [
            {
                "id": "1",
                "name": "Lotte Chocopie",
                "sku": "LC001",
                "category": "Confectionery",
                "quantity": 24,
                "price": 40.0,
                "cost_price": 32.0,
                "supplier_id": "1",
                "reorder_level": 10,
                "last_updated": datetime.now().isoformat()
            },
            {
                "id": "2",
                "name": "Tata Salt",
                "sku": "TS001",
                "category": "Essentials",
                "quantity": 50,
                "price": 20.0,
                "cost_price": 16.0,
                "supplier_id": "2",
                "reorder_level": 15,
                "last_updated": datetime.now().isoformat()
            },
            {
                "id": "3",
                "name": "Basmati Rice (1kg)",
                "sku": "BR001",
                "category": "Staples",
                "quantity": 30,
                "price": 80.0,
                "cost_price": 65.0,
                "supplier_id": "3",
                "reorder_level": 10,
                "last_updated": datetime.now().isoformat()
            },
            {
                "id": "4",
                "name": "Toor Dal (500g)",
                "sku": "TD001",
                "category": "Staples",
                "quantity": 35,
                "price": 60.0,
                "cost_price": 48.0,
                "supplier_id": "3",
                "reorder_level": 12,
                "last_updated": datetime.now().isoformat()
            },
            {
                "id": "5",
                "name": "Amul Butter (100g)",
                "sku": "AB001",
                "category": "Dairy",
                "quantity": 20,
                "price": 50.0,
                "cost_price": 43.0,
                "supplier_id": "4",
                "reorder_level": 8,
                "last_updated": datetime.now().isoformat()
            }
        ]
        _write_json_file(INVENTORY_FILE, inventory)
    
    # Check if customers is empty
    customers = _read_json_file(CUSTOMERS_FILE)
    if not customers.get("customers"):
        # Add sample customers
        customers["customers"] = [
            {
                "id": "1",
                "name": "Rahul Sharma",
                "phone": "9876543210",
                "payment_method": "cash",
                "address": "123 Main Street, Mumbai",
                "last_order_date": datetime.now().isoformat()
            },
            {
                "id": "2",
                "name": "Priya Patel",
                "phone": "8765432109",
                "payment_method": "upi",
                "address": "456 Park Avenue, Delhi",
                "last_order_date": datetime.now().isoformat()
            }
        ]
        _write_json_file(CUSTOMERS_FILE, customers)
    
    # Check if suppliers is empty
    suppliers = _read_json_file(SUPPLIERS_FILE)
    if not suppliers.get("suppliers"):
        # Add sample suppliers
        suppliers["suppliers"] = [
            {
                "id": "1",
                "name": "Sweet Treats Distributors",
                "phone": "7654321098",
                "products": ["Chocolates", "Candies", "Confectionery"],
                "address": "789 Sweet Lane, Chennai",
                "payment_terms": "net 30"
            },
            {
                "id": "2",
                "name": "Essential Goods Supply",
                "phone": "6543210987",
                "products": ["Salt", "Sugar", "Spices"],
                "address": "101 Market Road, Kolkata",
                "payment_terms": "net 15"
            },
            {
                "id": "3",
                "name": "Farm Fresh Foods",
                "phone": "5432109876",
                "products": ["Rice", "Dal", "Flour"],
                "address": "202 Grain Street, Bangalore",
                "payment_terms": "net 30"
            },
            {
                "id": "4",
                "name": "Dairy Delights",
                "phone": "4321098765",
                "products": ["Milk", "Butter", "Cheese"],
                "address": "303 Dairy Road, Hyderabad",
                "payment_terms": "net 7"
            }
        ]
        _write_json_file(SUPPLIERS_FILE, suppliers)
    
    # Check if orders is empty
    orders = _read_json_file(ORDERS_FILE)
    if not orders.get("customer_orders"):
        # Add sample customer orders
        orders["customer_orders"] = [
            {
                "id": "1",
                "customer_id": "1",
                "customer_name": "Rahul Sharma",
                "items": [
                    {"product_id": "1", "product_name": "Lotte Chocopie", "quantity": 2, "price": 40.0}
                ],
                "total": 80.0,
                "items_count": 2,
                "status": "delivered",
                "payment_method": "cash",
                "date": "2023-07-10T14:30:00"
            },
            {
                "id": "2",
                "customer_id": "2",
                "customer_name": "Priya Patel",
                "items": [
                    {"product_id": "3", "product_name": "Basmati Rice (1kg)", "quantity": 1, "price": 80.0},
                    {"product_id": "4", "product_name": "Toor Dal (500g)", "quantity": 2, "price": 60.0}
                ],
                "total": 200.0,
                "items_count": 3,
                "status": "pending",
                "payment_method": "upi",
                "date": "2023-07-12T16:45:00"
            }
        ]
        
        # Add sample supplier orders
        orders["supplier_orders"] = [
            {
                "id": "1",
                "supplier_id": "1",
                "supplier_name": "Sweet Treats Distributors",
                "items": [
                    {"product_id": "1", "product_name": "Lotte Chocopie", "quantity": 20, "cost": 32.0}
                ],
                "total": 640.0,
                "status": "received",
                "date": "2023-07-05T10:15:00"
            },
            {
                "id": "2",
                "supplier_id": "3",
                "supplier_name": "Farm Fresh Foods",
                "items": [
                    {"product_id": "3", "product_name": "Basmati Rice (1kg)", "quantity": 15, "cost": 65.0},
                    {"product_id": "4", "product_name": "Toor Dal (500g)", "quantity": 20, "cost": 48.0}
                ],
                "total": 1935.0,
                "status": "ordered",
                "date": "2023-07-08T11:30:00"
            }
        ]
        _write_json_file(ORDERS_FILE, orders)

def _read_json_file(file_path):
    """Read and parse a JSON file"""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error reading {file_path}: {str(e)}")
        return {}

def _write_json_file(file_path, data):
    """Write data to a JSON file"""
    try:
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error writing to {file_path}: {str(e)}")
        return False

# Inventory operations
def get_inventory_items(limit=None):
    """Get all inventory items with optional limit"""
    inventory = _read_json_file(INVENTORY_FILE)
    items = inventory.get("items", [])
    
    if limit and limit > 0:
        return items[:limit]
    return items

def get_inventory_item(item_id):
    """Get a specific inventory item by ID"""
    inventory = _read_json_file(INVENTORY_FILE)
    items = inventory.get("items", [])
    
    for item in items:
        if item.get("id") == item_id:
            return item
    
    return None

def update_inventory_item(item_id, updates):
    """Update an inventory item"""
    inventory = _read_json_file(INVENTORY_FILE)
    items = inventory.get("items", [])
    
    for i, item in enumerate(items):
        if item.get("id") == item_id:
            items[i].update(updates)
            items[i]["last_updated"] = datetime.now().isoformat()
            _write_json_file(INVENTORY_FILE, inventory)
            return items[i]
    
    return None

def add_inventory_item(item_data):
    """Add a new inventory item"""
    inventory = _read_json_file(INVENTORY_FILE)
    items = inventory.get("items", [])
    
    # Generate a new ID
    new_id = str(int(time.time()))
    item_data["id"] = new_id
    item_data["last_updated"] = datetime.now().isoformat()
    
    items.append(item_data)
    inventory["items"] = items
    
    _write_json_file(INVENTORY_FILE, inventory)
    return item_data

# Customer operations
def get_customers(limit=None):
    """Get all customers with optional limit"""
    customers = _read_json_file(CUSTOMERS_FILE)
    customer_list = customers.get("customers", [])
    
    if limit and limit > 0:
        return customer_list[:limit]
    return customer_list

def get_customer(customer_id):
    """Get a specific customer by ID"""
    customers = _read_json_file(CUSTOMERS_FILE)
    customer_list = customers.get("customers", [])
    
    for customer in customer_list:
        if customer.get("id") == customer_id:
            return customer
    
    return None

def add_customer(customer_data):
    """Add a new customer"""
    customers = _read_json_file(CUSTOMERS_FILE)
    customer_list = customers.get("customers", [])
    
    # Generate a new ID
    new_id = str(int(time.time()))
    customer_data["id"] = new_id
    
    customer_list.append(customer_data)
    customers["customers"] = customer_list
    
    _write_json_file(CUSTOMERS_FILE, customers)
    return customer_data

# Supplier operations
def get_suppliers(limit=None):
    """Get all suppliers with optional limit"""
    suppliers = _read_json_file(SUPPLIERS_FILE)
    supplier_list = suppliers.get("suppliers", [])
    
    if limit and limit > 0:
        return supplier_list[:limit]
    return supplier_list

def get_supplier(supplier_id):
    """Get a specific supplier by ID"""
    suppliers = _read_json_file(SUPPLIERS_FILE)
    supplier_list = suppliers.get("suppliers", [])
    
    for supplier in supplier_list:
        if supplier.get("id") == supplier_id:
            return supplier
    
    return None

def add_supplier(supplier_data):
    """Add a new supplier"""
    suppliers = _read_json_file(SUPPLIERS_FILE)
    supplier_list = suppliers.get("suppliers", [])
    
    # Generate a new ID
    new_id = str(int(time.time()))
    supplier_data["id"] = new_id
    
    supplier_list.append(supplier_data)
    suppliers["suppliers"] = supplier_list
    
    _write_json_file(SUPPLIERS_FILE, suppliers)
    return supplier_data

# Order operations
def get_customer_orders(limit=None):
    """Get all customer orders with optional limit"""
    orders = _read_json_file(ORDERS_FILE)
    order_list = orders.get("customer_orders", [])
    
    if limit and limit > 0:
        return order_list[:limit]
    return order_list

def get_supplier_orders(limit=None):
    """Get all supplier orders with optional limit"""
    orders = _read_json_file(ORDERS_FILE)
    order_list = orders.get("supplier_orders", [])
    
    if limit and limit > 0:
        return order_list[:limit]
    return order_list

def add_customer_order(order_data):
    """Add a new customer order"""
    orders = _read_json_file(ORDERS_FILE)
    order_list = orders.get("customer_orders", [])
    
    # Generate a new ID
    new_id = str(int(time.time()))
    order_data["id"] = new_id
    order_data["date"] = datetime.now().isoformat()
    
    order_list.append(order_data)
    orders["customer_orders"] = order_list
    
    _write_json_file(ORDERS_FILE, orders)
    return order_data

def add_supplier_order(order_data):
    """Add a new supplier order"""
    orders = _read_json_file(ORDERS_FILE)
    order_list = orders.get("supplier_orders", [])
    
    # Generate a new ID
    new_id = str(int(time.time()))
    order_data["id"] = new_id
    order_data["date"] = datetime.now().isoformat()
    
    order_list.append(order_data)
    orders["supplier_orders"] = order_list
    
    _write_json_file(ORDERS_FILE, orders)
    return order_data

# Chat messages operations
def add_customer_message(message_data):
    """Add a customer message to the order history"""
    # This is a simplified implementation
    # In a real application, you would track all messages
    # Here we just add a simple order if the message is an order
    
    if message_data.get("customer_intent") == "order" and message_data.get("products"):
        # Create a simple order from the message
        customer = {
            "name": "Customer from Telegram",
            "phone": "0000000000",
            "payment_method": "cash",
            "address": "Default Address"
        }
        
        # Add customer if not exists
        customer_id = _find_or_create_customer(customer)
        
        # Create order
        order_items = []
        total = 0
        
        for product_name in message_data.get("products", []):
            # Find product in inventory
            inventory = get_inventory_items()
            for item in inventory:
                if item.get("name", "").lower() == product_name.lower():
                    order_items.append({
                        "product_id": item.get("id"),
                        "product_name": item.get("name"),
                        "quantity": 1,
                        "price": item.get("price", 0)
                    })
                    total += item.get("price", 0)
                    break
        
        if order_items:
            order_data = {
                "customer_id": customer_id,
                "customer_name": customer.get("name"),
                "items": order_items,
                "total": total,
                "items_count": len(order_items),
                "status": "pending",
                "payment_method": customer.get("payment_method"),
                "date": datetime.now().isoformat()
            }
            
            return add_customer_order(order_data)
    
    return None

def add_supplier_message(message_data):
    """Add a supplier message to the order history"""
    # This is a simplified implementation
    # In a real application, you would track all messages
    # Here we just add a simple order if the message is an offer
    
    if message_data.get("supplier_intent") == "offer" and message_data.get("products"):
        # Create a simple supplier from the message
        supplier = {
            "name": "Supplier from Telegram",
            "phone": "0000000000",
            "products": message_data.get("products", []),
            "address": "Default Address",
            "payment_terms": "net 30"
        }
        
        # Add supplier if not exists
        supplier_id = _find_or_create_supplier(supplier)
        
        # Create order
        order_items = []
        total = 0
        
        for product_name in message_data.get("products", []):
            # Find product in inventory
            inventory = get_inventory_items()
            for item in inventory:
                if item.get("name", "").lower() == product_name.lower():
                    order_items.append({
                        "product_id": item.get("id"),
                        "product_name": item.get("name"),
                        "quantity": 10,  # Default quantity
                        "cost": item.get("cost_price", 0)
                    })
                    total += 10 * item.get("cost_price", 0)
                    break
        
        if order_items:
            order_data = {
                "supplier_id": supplier_id,
                "supplier_name": supplier.get("name"),
                "items": order_items,
                "total": total,
                "status": "pending",
                "date": datetime.now().isoformat()
            }
            
            return add_supplier_order(order_data)
    
    return None

def _find_or_create_customer(customer_data):
    """Find a customer by phone or create a new one"""
    customers = get_customers()
    
    for customer in customers:
        if customer.get("phone") == customer_data.get("phone"):
            return customer.get("id")
    
    # Customer not found, create new
    new_customer = add_customer(customer_data)
    return new_customer.get("id")

def _find_or_create_supplier(supplier_data):
    """Find a supplier by phone or create a new one"""
    suppliers = get_suppliers()
    
    for supplier in suppliers:
        if supplier.get("phone") == supplier_data.get("phone"):
            return supplier.get("id")
    
    # Supplier not found, create new
    new_supplier = add_supplier(supplier_data)
    return new_supplier.get("id")

# Metrics operations
def get_inventory_metrics():
    """Calculate and return inventory metrics"""
    inventory = get_inventory_items()
    orders = get_customer_orders()
    supplier_orders = get_supplier_orders()
    
    # Calculate metrics
    # This is a simplified implementation
    
    # Stock Turnover Rate
    total_inventory_value = sum(item.get("price", 0) * item.get("quantity", 0) for item in inventory)
    total_cost_value = sum(item.get("cost_price", 0) * item.get("quantity", 0) for item in inventory)
    total_sales = sum(order.get("total", 0) for order in orders)
    
    turnover_rate = 4.3  # Default value for demo
    
    # Days Sales of Inventory (DSI)
    dsi = 15  # Default value for demo
    
    # Gross Margin Return on Investment (GMROI)
    if total_cost_value > 0:
        gmroi = ((total_sales - total_cost_value) / total_cost_value) * 100
    else:
        gmroi = 187  # Default value for demo
    
    # Inventory Accuracy
    inventory_accuracy = 92  # Default value for demo
    
    return {
        "turnover_rate": turnover_rate,
        "dsi": dsi,
        "gmroi": gmroi,
        "inventory_accuracy": inventory_accuracy,
        "total_inventory_value": total_inventory_value,
        "low_stock_items": [item for item in inventory if item.get("quantity", 0) <= item.get("reorder_level", 0)]
    }
