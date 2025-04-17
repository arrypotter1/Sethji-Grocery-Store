import logging
import requests
from config import TELEGRAM_API_KEY

logger = logging.getLogger(__name__)

class TelegramService:
    """Service for interacting with the Telegram API"""
    
    def __init__(self, api_key=None):
        self.api_key = api_key or TELEGRAM_API_KEY
        self.base_url = f"https://api.telegram.org/bot{self.api_key}"
        
    def send_message(self, chat_id, text):
        """
        Send a message to a specific chat
        
        Args:
            chat_id (str): Telegram chat ID
            text (str): Message text to send
        
        Returns:
            dict: Response from Telegram API
        """
        if not self.api_key:
            logger.warning("No Telegram API key provided. Message not sent.")
            return {"ok": False, "error": "No API key configured"}
            
        endpoint = f"{self.base_url}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "HTML"
        }
        
        try:
            response = requests.post(endpoint, json=payload)
            return response.json()
        except Exception as e:
            logger.error(f"Error sending Telegram message: {str(e)}")
            return {"ok": False, "error": str(e)}
    
    def get_updates(self, offset=None, limit=100):
        """
        Get updates from Telegram
        
        Args:
            offset (int, optional): Update ID to start from
            limit (int, optional): Maximum number of updates to retrieve
            
        Returns:
            dict: Response from Telegram API containing updates
        """
        if not self.api_key:
            logger.warning("No Telegram API key provided. Cannot get updates.")
            return {"ok": False, "error": "No API key configured"}
            
        endpoint = f"{self.base_url}/getUpdates"
        payload = {"limit": limit}
        
        if offset:
            payload["offset"] = offset
            
        try:
            response = requests.get(endpoint, params=payload)
            return response.json()
        except Exception as e:
            logger.error(f"Error getting Telegram updates: {str(e)}")
            return {"ok": False, "error": str(e)}
    
    def set_webhook(self, url):
        """
        Set webhook for Telegram updates
        
        Args:
            url (str): URL for the webhook
            
        Returns:
            dict: Response from Telegram API
        """
        if not self.api_key:
            logger.warning("No Telegram API key provided. Cannot set webhook.")
            return {"ok": False, "error": "No API key configured"}
            
        endpoint = f"{self.base_url}/setWebhook"
        payload = {"url": url}
        
        try:
            response = requests.post(endpoint, json=payload)
            return response.json()
        except Exception as e:
            logger.error(f"Error setting Telegram webhook: {str(e)}")
            return {"ok": False, "error": str(e)}

# Create a singleton instance
telegram_service = TelegramService()
