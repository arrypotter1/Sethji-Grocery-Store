# 🌟✨ Sethji.ai Overview 🌟✨

## Problem Statement 🛑
Many small retail stores struggle with inefficient inventory management, leading to overstocking 📦, stockouts 🚫, and missed sales opportunities 💸. 

Sethji.ai is an **AI-driven inventory and demand forecasting solution** 🤖 designed specifically for small retailers 🏪. It addresses the challenges of inefficient inventory management by providing **real-time tracking** ⏱️, **automated restocking alerts** 🔔, and **data-driven insights** 📊. The platform leverages advanced technologies such as **computer vision** 👁️ and **machine learning** 📈 to optimize inventory levels, reduce waste ♻️, and enhance overall operational efficiency ⚙️.

---

## Delighting Retailers Across the Globe 🌍❤️

![Image A](branding/1.jpeg)
![Image B](branding/2.png)

---

## Identified Scenarios 📋
The Sethji.ai solution aims to address these challenges by providing a comprehensive, user-friendly platform that enhances inventory management for small retailers, ultimately driving efficiency 🚀 and profitability 💰.

Retailers face numerous inventory management challenges, particularly during peak seasons 🌟 when stockouts of popular items lead to lost sales 📉. Small grocery stores often struggle with overstocking perishable goods 🍏, resulting in waste and spoilage 🗑️, while reliance on manual inventory tracking methods introduces inaccuracies ❌ and discrepancies in stock levels 📉. 

The inability to predict seasonal demand fluctuations 📅 further exacerbates misaligned inventory, and identifying slow-moving items 🐢 becomes difficult, tying up capital 💵 and storage space 📦. Without access to real-time sales insights 🔍, retailers are unable to make informed restocking decisions, and price competition 💲 adds pressure as they strive to keep up with competitors 🏆. 

Managing expiry dates for perishable goods ⏳ proves cumbersome without automated tracking, and inefficient reordering processes ⏲️ delay stock replenishment due to the lack of alerts for low inventory 🚨. Inconsistent supplier performance 📦 leads to unreliable stock availability, while retailers struggle to identify bestsellers 🌟, hindering effective inventory planning 🗓️. 

High wastage rates from excess inventory 📉, especially for food 🍔 and seasonal items 🎃, are compounded by inadequate training 📚 on inventory management practices, resulting in operational inefficiencies ⚠️. Limited access to data-driven insights 📊 restricts small retailers from making informed purchasing decisions 🛍️, and those with multiple locations 🌐 face challenges managing inventory effectively across stores. 

Manual stock reconciliation 📝 is time-consuming and error-prone ❗, and the inability to track inventory movement in real-time ⏱️ leads to discrepancies. Ultimately, stockouts 🚫 and overstocking 📦 negatively impact customer satisfaction 😊 and loyalty ❤️, while limited budgets for technology 💻 hinder the implementation of advanced inventory management solutions. Additionally, resistance to change among retail staff 🙅‍♂️ can result in the underutilization of new technologies 📉.

## ⚙️ Architecture Overview
Sethji.ai is a Python-based, modular AI system architected to solve granular retail inventory challenges using a collection of context-aware agents, domain-enforced business rules, and multi-modal interfaces. The system targets small retailers and distributed franchise environments, where access to enterprise-level ERP systems is limited, yet precision in stock handling, demand forecasting, and perishables tracking is critical. The backend stack is centered on Flask for RESTful routing and service orchestration, combined with SQLAlchemy as the ORM layer over a SQLite store augmented with Change Data Capture (CDC) metadata for auditability. Business rules such as reorder thresholds, SKU shelf-life, and expiry window enforcement are codified using structured JSON logic, interpreted at runtime by an internal rules engine.
![Image A](branding/sethji-architecture.png)

Inventory-related agents are built using lightweight ML pipelines in Scikit-learn, with support for ARIMA, RandomForest, and rolling mean ensemble models for SKU-level demand forecasting. These agents are invoked asynchronously through a context protocol layer that injects current sales patterns, seasonal tags, and shop-type persona metadata before prompt execution. The system is LLM-compatible, integrating with Google’s Gemini API for structured reasoning and summarization tasks, while voice interfaces are powered via Ultravox, a multilingual speech-to-text and text-to-speech wrapper that supports regional Indian languages. This enables both voice input and voice output for actions such as inventory checks, reorder triggers, and expiry alerts, making the platform accessible for semi-literate or low-tech users.

A Telegram bot agent is configured to handle both supplier-side purchase orders and customer-side item requests. It leverages NER and prompt-tuned intent parsing to extract SKU details, match against product embeddings via an optional vector database, and log transactions directly into the SQLite backend. The system supports data visualizations using Plotly Dash, exposing analytics such as slow-moving stock identification, spoilage heatmaps, order frequency histograms, and temporal sales trends. These dashboards consume pre-aggregated datasets stored in-memory via Pandas and NumPy and can be accessed via a Bootstrap-admin interface optimized for mobile shop use.

Security is layered through encrypted local DB storage (AES-256 at rest), HTTPS over Flask routes, and per-agent API token rotation. Optional Google Drive sync enables backup and synchronization for multi-device usage without requiring cloud-native infrastructure. Data privacy is enforced through configurable obfuscation rules for customer identifiers, supplier codes, and phone numbers. The entire system is microservice-ready, with the ability to containerize via Docker and deploy on edge devices such as Raspberry Pi or Android-based POS machines.

Finally, the platform integrates billing capabilities through UPI and Stripe for paid agents, CSV and POS system file ingestion for batch inventory, and compliance support for region-specific mandates such as price visibility laws and expiry labeling audits. The architecture is designed to be explainable-by-default, leveraging xAI frameworks (e.g., SHAP) for model transparency, and logs every inference, rule violation, or exception for traceable evaluation. Each LLM agent is wrapped with prompt enforcement layers ensuring output remains structured, executable, and JSON-valid — crucial for downstream automation in low-code retail environments.

Sethji.ai is purpose-built for real-world grocery, kirana, and franchise stores operating in bandwidth-constrained, multi-lingual environments, delivering precision inventory intelligence without cloud dependency or high-cost SaaS lock-ins.
