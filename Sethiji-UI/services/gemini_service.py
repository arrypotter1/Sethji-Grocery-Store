import logging
import os
import json
from config import GEMINI_API_KEY
import requests

logger = logging.getLogger(__name__)

class GeminiService:
    """Service for interacting with Google's Gemini API for text processing"""
    
    def __init__(self, api_key=None):
        self.api_key = api_key or GEMINI_API_KEY
        self.base_url = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent"
        
        logger.info("Initializing Gemini service")
    
    def process_text(self, text, prompt_context=""):
        """
        Process text input with the Gemini API
        
        Args:
            text (str): Input text to process
            prompt_context (str): Additional context for the prompt
            
        Returns:
            str: Processed response from Gemini
        """
        if not self.api_key:
            logger.warning("No Gemini API key provided. Using fallback response.")
            return self._get_fallback_response(text)
        
        full_prompt = f"{prompt_context}\n\nInput: {text}"
        
        try:
            response = self._call_gemini_api(full_prompt)
            return response
        except Exception as e:
            logger.error(f"Error calling Gemini API: {str(e)}")
            return self._get_fallback_response(text)
    
    def process_customer_message(self, message):
        """
        Process a customer message with Gemini API
        
        Args:
            message (str): Customer message to process
            
        Returns:
            dict: Processed data including customer info, order details, and response
        """
        prompt_context = """
        You are an AI assistant for a kirana store (small Indian grocery shop).
        Process the customer message and extract the following information in JSON format:
        1. Customer intent (order, inquiry, complaint, etc.)
        2. Products mentioned
        3. Quantities requested (if applicable)
        4. Any other relevant information
        
        The response should be 1-2 concise sentences, number-driven when appropriate.
        """
        
        try:
            # Process with Gemini
            response_text = self.process_text(message, prompt_context)
            
            # Simple fallback for demo purposes
            return {
                "original_message": message,
                "customer_intent": "order" if "order" in message.lower() else "inquiry",
                "products": self._extract_products(message),
                "response": response_text or self._get_fallback_response(message),
                "timestamp": "2023-07-15T12:30:45"
            }
        except Exception as e:
            logger.error(f"Error processing customer message: {str(e)}")
            return {
                "original_message": message,
                "customer_intent": "unknown",
                "products": [],
                "response": self._get_fallback_response(message),
                "timestamp": "2023-07-15T12:30:45"
            }
    
    def process_supplier_message(self, message):
        """
        Process a supplier message with Gemini API
        
        Args:
            message (str): Supplier message to process
            
        Returns:
            dict: Processed data including supplier info, product details, and response
        """
        prompt_context = """
        You are an AI assistant for a kirana store (small Indian grocery shop).
        Process the supplier message and extract the following information in JSON format:
        1. Supplier intent (offer, price update, delivery info, etc.)
        2. Products mentioned
        3. Prices mentioned (if applicable)
        4. Quantities available (if applicable)
        5. Any other relevant information
        
        The response should be 1-2 concise sentences, number-driven when appropriate.
        """
        
        try:
            # Process with Gemini
            response_text = self.process_text(message, prompt_context)
            
            # Simple fallback for demo purposes
            return {
                "original_message": message,
                "supplier_intent": "offer" if "available" in message.lower() else "inquiry",
                "products": self._extract_products(message),
                "response": response_text or self._get_fallback_response(message),
                "timestamp": "2023-07-15T13:45:30"
            }
        except Exception as e:
            logger.error(f"Error processing supplier message: {str(e)}")
            return {
                "original_message": message,
                "supplier_intent": "unknown",
                "products": [],
                "response": self._get_fallback_response(message),
                "timestamp": "2023-07-15T13:45:30"
            }
    
    def _call_gemini_api(self, prompt):
        """
        Call the Gemini API with a prompt
        
        Args:
            prompt (str): Prompt to send to Gemini
            
        Returns:
            str: Generated text from Gemini
        """
        url = f"{self.base_url}?key={self.api_key}"
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 100
            }
        }
        
        try:
            response = requests.post(url, json=payload)
            response_json = response.json()
            
            # Extract the generated text
            if 'candidates' in response_json and len(response_json['candidates']) > 0:
                candidate = response_json['candidates'][0]
                if 'content' in candidate and 'parts' in candidate['content']:
                    parts = candidate['content']['parts']
                    if len(parts) > 0 and 'text' in parts[0]:
                        return parts[0]['text'].strip()
            
            logger.warning(f"Unexpected Gemini API response structure: {response_json}")
            return None
        except Exception as e:
            logger.error(f"Error in Gemini API call: {str(e)}")
            return None
    
    def _get_fallback_response(self, message):
        """
        Generate a fallback response when API is unavailable
        
        Args:
            message (str): Original message
            
        Returns:
            str: Fallback response
        """
        # Simple keyword-based fallback responses
        message_lower = message.lower()
        
        if "order" in message_lower or "buy" in message_lower:
            return "I've noted your order request. Let me check availability and get back to you shortly."
        
        if "price" in message_lower or "cost" in message_lower:
            return "The current price for this item is ₹45 per unit. We have 30 units in stock."
        
        if "stock" in message_lower or "available" in message_lower:
            return "We currently have 20 units in stock. Would you like to place an order?"
        
        if "delivery" in message_lower:
            return "Delivery can be arranged within 2 days for orders above ₹500."
        
        # Generic fallback
        return "I understand your message. How can I assist you further with your request?"
    
    def _extract_products(self, message):
        """
        Simple function to extract product mentions from a message
        
        Args:
            message (str): Message to analyze
            
        Returns:
            list: List of products mentioned
        """
        # This is a very simplistic implementation
        # In a real app, you would use NLP or the Gemini API for this
        products = []
        
        # Check for common products
        product_keywords = {
            "rice": "Rice",
            "dal": "Dal",
            "sugar": "Sugar",
            "oil": "Cooking Oil",
            "flour": "Wheat Flour",
            "atta": "Atta",
            "milk": "Milk",
            "bread": "Bread",
            "biscuit": "Biscuits",
            "tea": "Tea",
            "coffee": "Coffee",
            "soap": "Soap",
            "shampoo": "Shampoo",
            "detergent": "Detergent",
            "chocopie": "Chocopie",
            "chocolate": "Chocolate"
        }
        
        message_lower = message.lower()
        for keyword, product_name in product_keywords.items():
            if keyword in message_lower:
                products.append(product_name)
        
        return products

# Initialize the service
gemini_service = GeminiService()

# Expose the methods for direct import
def process_customer_message(message):
    return gemini_service.process_customer_message(message)

def process_supplier_message(message):
    return gemini_service.process_supplier_message(message)
