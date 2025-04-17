from telegram.ext import Application, MessageHandler, CommandHandler, filters, ConversationHandler
from telegram import Update, ReplyKeyboardMarkup, ReplyKeyboardRemove
from gemini import get_gemini_response
import logging
import sys
import os
import json
import signal
import atexit
from datetime import datetime
import re
import random

# Enable basic logging to console with more details
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Create a PID file to track running instance
PID_FILE = "bot.pid"

def cleanup():
    """Clean up function to remove PID file on exit"""
    try:
        if os.path.exists(PID_FILE):
            os.remove(PID_FILE)
            logger.info("Cleaned up PID file")
    except Exception as e:
        logger.error(f"Error cleaning up: {e}")

def check_single_instance():
    """Ensure only one instance of the bot is running"""
    try:
        if os.path.exists(PID_FILE):
            with open(PID_FILE, 'r') as f:
                old_pid = int(f.read().strip())
            try:
                os.kill(old_pid, 0)
                logger.error(f"Bot is already running with PID {old_pid}")
                sys.exit(1)
            except OSError:
                # Process not found, safe to proceed
                pass
        
        # Write current PID
        with open(PID_FILE, 'w') as f:
            f.write(str(os.getpid()))
    except Exception as e:
        logger.error(f"Error checking for running instance: {e}")
        sys.exit(1)

# Register cleanup handlers
atexit.register(cleanup)
signal.signal(signal.SIGINT, lambda s, f: sys.exit(0))
signal.signal(signal.SIGTERM, lambda s, f: sys.exit(0))

# Telegram bot token
TOKEN = "7504485691:AAGWnamtHW_sFvwq0gI_EocUp6-mdUzzr2I"

# File paths
VENDOR_MESSAGE_DIR = "vendor_message"
SUPPLIER_FILE = os.path.join(VENDOR_MESSAGE_DIR, "supplier.json")
INVENTORY_FILE = os.path.join("inventory", "current_inventory.json")
ORDERS_FILE = os.path.join(VENDOR_MESSAGE_DIR, "orders.json")
MESSAGE_FILE = os.path.join(VENDOR_MESSAGE_DIR, "messages.json")

# States for conversation handler
(REGISTER_NAME, REGISTER_BUSINESS, REGISTER_CONTACT, REGISTER_ADDRESS, REGISTER_ITEMS) = map(chr, range(5))

# Ensure directories exist
os.makedirs(VENDOR_MESSAGE_DIR, exist_ok=True)
os.makedirs("inventory", exist_ok=True)

def load_inventory():
    try:
        with open(INVENTORY_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        print("Error: Could not load inventory data.")
        return []

def save_inventory(data):
    with open(INVENTORY_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def load_supplier_data():
    try:
        with open(SUPPLIER_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def save_supplier_data(data):
    with open(SUPPLIER_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def load_orders():
    try:
        with open(ORDERS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_orders(orders):
    with open(ORDERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(orders, f, indent=4, ensure_ascii=False)

def load_messages():
    """Load conversation messages from json file"""
    try:
        with open(MESSAGE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_message(user_id, user_name, message_text, is_bot=False):
    """Save a message to the conversation history"""
    messages = load_messages()
    message = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "user_id": user_id,
        "user_name": user_name,
        "message": message_text,
        "is_bot": is_bot
    }
    messages.append(message)
    with open(MESSAGE_FILE, 'w', encoding='utf-8') as f:
        json.dump(messages, f, indent=4, ensure_ascii=False)

def clear_all_json():
    """Clear all JSON files"""
    empty_data = {
        MESSAGE_FILE: [],
        SUPPLIER_FILE: {},
        ORDERS_FILE: [],
        INVENTORY_FILE: []
    }
    
    for file_path, default_data in empty_data.items():
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(default_data, f, indent=4, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error clearing {file_path}: {e}")

def initialize_dummy_inventory():
    """Initialize dummy inventory data"""
    dummy_inventory = [
        {
            "product_name": "Rice",
            "quantity": 100,
            "alert_threshold": 20,
            "unit": "kg"
        },
        {
            "product_name": "Sugar",
            "quantity": 50,
            "alert_threshold": 15,
            "unit": "kg"
        },
        {
            "product_name": "Lentils",
            "quantity": 75,
            "alert_threshold": 25,
            "unit": "kg"
        },
        {
            "product_name": "Wheat Flour",
            "quantity": 60,
            "alert_threshold": 20,
            "unit": "kg"
        },
        {
            "product_name": "Cooking Oil",
            "quantity": 40,
            "alert_threshold": 10,
            "unit": "L"
        }
    ]
    save_inventory(dummy_inventory)

def initialize_files():
    """Initialize all required files with empty data and dummy inventory"""
    # Clear all JSON files first
    clear_all_json()
    
    # Initialize dummy inventory
    initialize_dummy_inventory()
    
    print(f"\nInitialized data stores in {VENDOR_MESSAGE_DIR} with dummy inventory")

def get_intent(text):
    """Use Gemini to determine user intent from natural language"""
    prompt = """As Sethji Kirana Store's AI assistant, determine the user's intent from this message. 
    Possible intents are:
    - register (if they want to register as supplier)
    - inventory (if they want to check stock)
    - order (if they want to place an order)
    - general (for general conversation)
    
    User message: """ + text
    
    response = get_gemini_response(prompt)
    return response.lower().strip()

def generate_store_response(text, context=None):
    """Generate contextual response using Gemini"""
    store_context = """You are Sethji Kirana Store's AI assistant. Be friendly and use Indian style greetings when appropriate.
    Available features:
    - Supplier registration
    - Inventory checking
    - Order placement
    
    Current inventory includes: Rice, Sugar, Lentils, Wheat Flour, and Cooking Oil.
    """
    
    if context:
        store_context += f"\nContext: {context}"
    
    prompt = store_context + f"\n\nUser message: {text}\nResponse:"
    return get_gemini_response(prompt)

async def start_command(update, context):
    """Handler for /start command"""
    user = update.effective_user
    greeting = f"🙏 Namaste {user.first_name}!\n\n"
    greeting += "Welcome to Sethji Kirana Store's Supplier Management System.\n\n"
    greeting += "I'm here to help you with:\n"
    greeting += "📦 Supplier Registration\n"
    greeting += "📊 Inventory Management\n"
    greeting += "🛍️ Order Placement\n\n"
    greeting += "Available commands:\n"
    greeting += "/register - Register as a supplier\n"
    greeting += "/checkinventory - Check current stock levels\n"
    greeting += "/placeorder - Place new orders\n"
    greeting += "/status - Check order status\n"
    greeting += "/help - Show this menu again"
    
    await update.message.reply_text(greeting)

async def help_command(update, context):
    """Handler for /help command"""
    await start_command(update, context)

async def register_command(update, context):
    """Starts the supplier registration conversation"""
    welcome_text = "🙏 Welcome to Sethji Kirana Store's Supplier Registration!\n\n"
    welcome_text += "Let's get your business registered with us.\n"
    welcome_text += "First, please tell me your full name?"
    
    await update.message.reply_text(welcome_text, reply_markup=ReplyKeyboardRemove())
    return REGISTER_NAME

async def register_name(update, context):
    context.user_data["name"] = update.message.text
    await update.message.reply_text(
        f"Thank you, {context.user_data['name']}!\n"
        "Now, please tell me your business name:"
    )
    return REGISTER_BUSINESS

async def register_business(update, context):
    context.user_data["business_name"] = update.message.text
    await update.message.reply_text(
        "Great! Please provide your contact number:"
    )
    return REGISTER_CONTACT

async def register_contact(update, context):
    context.user_data["contact"] = update.message.text
    await update.message.reply_text(
        "Please provide your business address:"
    )
    return REGISTER_ADDRESS

async def register_address(update, context):
    context.user_data["address"] = update.message.text
    await update.message.reply_text(
        "What items can you supply? Please list them separated by commas\n"
        "(e.g., Rice, Sugar, Lentils)"
    )
    return REGISTER_ITEMS

async def register_items(update, context):
    context.user_data["items"] = [item.strip() for item in update.message.text.split(",")]
    
    # Save supplier data
    supplier_data = {
        "name": context.user_data["name"],
        "business_name": context.user_data["business_name"],
        "contact": context.user_data["contact"],
        "address": context.user_data["address"],
        "items": context.user_data["items"],
        "registration_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "status": "active"
    }
    save_supplier_data(supplier_data)
    
    response = "✅ Registration Complete!\n\n"
    response += f"Business: {supplier_data['business_name']}\n"
    response += f"Contact: {supplier_data['contact']}\n"
    response += f"Items: {', '.join(supplier_data['items'])}\n\n"
    response += "You can now:\n"
    response += "• Use /checkinventory to see current stock levels\n"
    response += "• Wait for order notifications when stock is low"
    
    await update.message.reply_text(response, reply_markup=ReplyKeyboardRemove())
    return ConversationHandler.END

async def check_inventory(update, context):
    """Checks and displays inventory status"""
    inventory = load_inventory()
    
    if not inventory:
        await update.message.reply_text("❌ No inventory data available.")
        return
    
    response = "📊 Current Inventory Status:\n\n"
    low_stock_items = []
    
    for item in inventory:
        status = "🟢" if item["quantity"] > item["alert_threshold"] else "🔴"
        response += f"{status} {item['product_name']}\n"
        response += f"   Quantity: {item['quantity']}\n"
        response += f"   Alert at: {item['alert_threshold']}\n\n"
        
        if item["quantity"] <= item["alert_threshold"]:
            low_stock_items.append(item)
    
    if low_stock_items:
        response += "⚠️ Low Stock Alert:\n"
        for item in low_stock_items:
            response += f"• {item['product_name']} (Only {item['quantity']} left)\n"
        response += "\nUse /placeorder to order these items."
    
    await update.message.reply_text(response)

async def place_order(update, context):
    """Initiates order placement for low stock items"""
    inventory = load_inventory()
    low_stock_items = [item for item in inventory if item["quantity"] <= item["alert_threshold"]]
    supplier_data = load_supplier_data()
    
    if not supplier_data:
        await update.message.reply_text(
            "❌ No supplier registered.\n"
            "Please use /register to register first."
        )
        return ConversationHandler.END
    
    if not low_stock_items:
        await update.message.reply_text("✅ All items are well stocked!")
        return ConversationHandler.END
    
    order_details = {
        "order_id": f"ORD{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "supplier": supplier_data,
        "items": low_stock_items,
        "status": "pending"
    }
    
    # Save order
    orders = load_orders()
    orders.append(order_details)
    save_orders(orders)
    
    response = "📝 Order Details:\n\n"
    response += f"Order ID: {order_details['order_id']}\n"
    response += f"Supplier: {supplier_data['business_name']}\n"
    response += "\nItems to order:\n"
    for item in low_stock_items:
        response += f"• {item['product_name']} (Current: {item['quantity']})\n"
    
    response += "\nOrder has been placed! We'll notify you of updates."
    
    await update.message.reply_text(response)
    return ConversationHandler.END

async def cancel(update, context):
    """Cancels the current operation"""
    await update.message.reply_text(
        "Operation cancelled.", 
        reply_markup=ReplyKeyboardRemove()
    )
    return ConversationHandler.END

async def handle_message(update, context):
    """Handle all incoming messages using natural language processing"""
    user = update.effective_user
    message_text = update.message.text
    
    # Save user message
    save_message(user.id, user.first_name, message_text, is_bot=False)
    
    # Check for clear command
    if message_text.lower().strip() == "clear":
        clear_all_json()
        response = "🧹 All data has been cleared!"
        save_message(None, "Bot", response, is_bot=True)
        await update.message.reply_text(response)
        return
    
    # Get user intent using Gemini
    intent = get_intent(message_text)
    
    if "register" in intent:
        # Start registration process
        context.user_data['conversation_state'] = 'registration'
        response = generate_store_response(
            "User wants to register as supplier",
            "Starting registration process"
        )
        save_message(None, "Bot", response, is_bot=True)
        await update.message.reply_text(response)
        await update.message.reply_text("Please tell me your full name:")
        save_message(None, "Bot", "Please tell me your full name:", is_bot=True)
        return REGISTER_NAME
        
    elif "inventory" in intent:
        # Show inventory status
        inventory = load_inventory()
        inventory_context = "Current inventory status:\n" + \
            "\n".join([f"{item['product_name']}: {item['quantity']} units" for item in inventory])
        
        response = generate_store_response(
            message_text,
            inventory_context
        )
        save_message(None, "Bot", response, is_bot=True)
        await update.message.reply_text(response)
        
    elif "order" in intent:
        # Handle order intent
        inventory = load_inventory()
        low_stock = [item for item in inventory if item["quantity"] <= item["alert_threshold"]]
        
        if low_stock:
            response = generate_store_response(
                message_text,
                f"Low stock items: {', '.join(item['product_name'] for item in low_stock)}"
            )
        else:
            response = generate_store_response(
                message_text,
                "All items are well stocked"
            )
        save_message(None, "Bot", response, is_bot=True)
        await update.message.reply_text(response)
        
    else:
        # General conversation
        response = generate_store_response(message_text)
        save_message(None, "Bot", response, is_bot=True)
        await update.message.reply_text(response)

def simulate_inventory_changes():
    """Simulate random changes in inventory quantities"""
    inventory = load_inventory()
    changes = []
    
    for item in inventory:
        # Random change between -30 and +20
        change = random.randint(-30, 20)
        old_quantity = item["quantity"]
        item["quantity"] = max(0, old_quantity + change)
        
        changes.append({
            "product": item["product_name"],
            "old_quantity": old_quantity,
            "new_quantity": item["quantity"],
            "change": change,
            "is_low": item["quantity"] <= item["alert_threshold"]
        })
    
    save_inventory(inventory)
    return changes

async def simulate_and_show_alerts(update, context):
    """Simulate inventory changes and show alerts"""
    changes = simulate_inventory_changes()
    
    response = "🔄 Inventory Simulation Results:\n\n"
    low_stock_items = []
    
    for change in changes:
        emoji = "🔴" if change["is_low"] else "🟢"
        response += f"{emoji} {change['product']}:\n"
        response += f"   Before: {change['old_quantity']}\n"
        response += f"   After: {change['new_quantity']}\n"
        response += f"   Change: {change['change']:+d}\n\n"
        
        if change["is_low"]:
            low_stock_items.append(change)
    
    if low_stock_items:
        response += "⚠️ LOW STOCK ALERTS:\n"
        for item in low_stock_items:
            response += f"• {item['product']}: Only {item['new_quantity']} units left!\n"
        response += "\nPlease use /placeorder to restock these items."
    else:
        response += "✅ All stock levels are normal."
    
    await update.message.reply_text(response)

def main():
    """Start the bot"""
    try:
        # Check for other instances and initialize
        check_single_instance()
        initialize_files()
        
        # Create application instance
        app = Application.builder().token(TOKEN).build()
        
        # Add conversation handler
        conv_handler = ConversationHandler(
            entry_points=[MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message)],
            states={
                REGISTER_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, register_name)],
                REGISTER_BUSINESS: [MessageHandler(filters.TEXT & ~filters.COMMAND, register_business)],
                REGISTER_CONTACT: [MessageHandler(filters.TEXT & ~filters.COMMAND, register_contact)],
                REGISTER_ADDRESS: [MessageHandler(filters.TEXT & ~filters.COMMAND, register_address)],
                REGISTER_ITEMS: [MessageHandler(filters.TEXT & ~filters.COMMAND, register_items)],
            },
            fallbacks=[MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message)]
        )
        
        # Add all handlers
        app.add_handler(conv_handler)
        app.add_handler(CommandHandler("simulate", simulate_and_show_alerts))
        app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
        
        print("✨ Sethji Kirana Store Bot is running!")
        print("Chat with @sethjivendorbot")
        print("Use /simulate to simulate inventory changes")
        
        # Start polling
        app.run_polling(drop_pending_updates=True)
        
    except Exception as e:
        logger.error(f"Error: {e}")
        cleanup()
        sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nBot stopped by user")
        cleanup()
    except Exception as e:
        print(f"\nError: {str(e)}")
        cleanup()
        sys.exit(1)