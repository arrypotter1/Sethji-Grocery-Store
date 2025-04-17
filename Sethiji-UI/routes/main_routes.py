from flask import Blueprint, render_template, request, jsonify
from database.db_manager import (
    get_inventory_items,
    get_customer_orders,
    get_supplier_orders,
    add_customer_message,
    add_supplier_message,
    get_inventory_metrics
)
from services.gemini_service import process_customer_message, process_supplier_message
import logging

logger = logging.getLogger(__name__)

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """Main page route"""
    inventory = get_inventory_items(limit=10)
    customer_orders = get_customer_orders(limit=5)
    supplier_orders = get_supplier_orders(limit=5)
    metrics = get_inventory_metrics()
    
    return render_template(
        'index.html',
        inventory=inventory,
        customer_orders=customer_orders,
        supplier_orders=supplier_orders,
        metrics=metrics
    )

@main_bp.route('/integration/telegram')
def telegram_integration():
    """Telegram integration page"""
    return render_template('integration_telegram.html')

@main_bp.route('/integration/ultravox')
def ultravox_integration():
    """UltraVox integration page"""
    return render_template('integration_ultravox.html')

@main_bp.route('/api/customer/message', methods=['POST'])
def handle_customer_message():
    """API endpoint to handle customer messages"""
    message = request.json.get('message', '')
    if not message:
        return jsonify({'status': 'error', 'message': 'No message provided'}), 400
    
    # Process message with Gemini
    try:
        processed_data = process_customer_message(message)
        # Save message to database
        add_customer_message(processed_data)
        return jsonify({
            'status': 'success',
            'response': processed_data['response']
        })
    except Exception as e:
        logger.error(f"Error processing customer message: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@main_bp.route('/api/supplier/message', methods=['POST'])
def handle_supplier_message():
    """API endpoint to handle supplier messages"""
    message = request.json.get('message', '')
    if not message:
        return jsonify({'status': 'error', 'message': 'No message provided'}), 400
    
    # Process message with Gemini
    try:
        processed_data = process_supplier_message(message)
        # Save message to database
        add_supplier_message(processed_data)
        return jsonify({
            'status': 'success',
            'response': processed_data['response']
        })
    except Exception as e:
        logger.error(f"Error processing supplier message: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@main_bp.route('/api/metrics')
def get_metrics():
    """API endpoint to get inventory metrics"""
    metrics = get_inventory_metrics()
    return jsonify(metrics)

@main_bp.route('/inventory')
def inventory():
    """Inventory management page"""
    return render_template('inventory.html')

@main_bp.route('/api/inventory')
def api_inventory():
    """API endpoint to get inventory items"""
    items = get_inventory_items()
    return jsonify({'items': items})
