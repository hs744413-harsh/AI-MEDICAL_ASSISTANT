# 🏥 Medical Assistant AI  
### ⚡ Intelligent • Reliable • AI-Powered Healthcare Assistant

<p align="center">
  🤖 Diagnose smarter • 🔍 Research deeper • 🧠 Powered by AI  
</p>

---

## 🚀 Overview

**Medical Assistant AI** is a next-generation healthcare assistant that combines  
Machine Learning + LLMs + Real-Time Web Intelligence to deliver:

✨ Symptom-based disease prediction  
✨ Context-aware medical insights  
✨ Reliable fallback via live web search  

It intelligently switches between **Diagnose Mode** and **Research Mode** to ensure accuracy.

---

## 🎯 What Makes It Powerful?

- 🧠 **Dual AI System** → ML + LLM working together  
- 🔁 **Fallback Mechanism** → Never leaves user without answer  
- 🌐 **Real-Time Knowledge** → Tavily-powered web search  
- 📊 **Confidence-Based Decisions** → Smart switching logic  
- 📄 **Automated Medical Reports** → Structured output  

---

## ⚙️ Working Flow
<img width="1122" height="1402" alt="ChatGPT Image Apr 29, 2026, 12_06_58 AM" src="https://github.com/user-attachments/assets/d3491038-31c2-4937-b54e-dbcdd66d7be2" />



---

## 🩺 Diagnose Mode

- Uses **Random Forest ML Model**
- Predicts disease based on symptoms  

- Applies confidence threshold  
- Fetches disease details from Wikipedia  
- Generates structured report using LLM  

---

## 🔬 Research Mode

Activated when:
- Prediction confidence is low  
- User directly asks for disease info  

Features:
- 🌐 Tavily API for real-time search  
- 🧠 LLM-enhanced reasoning  
- 📚 Deep disease insights  
- 🔁 Backup diagnosis system  

---

## 🏗️ Architecture

| Layer        | Technology |
|-------------|------------|
| 🎨 Frontend  | React |
| ⚙️ Backend   | FastAPI |
| 🧠 ML Model  | Random Forest (Scikit-learn) |
| 🤖 LLM       | LLaMA 3 (Groq API) |
| 🔍 Search    | Tavily API |
| 📚 Data      | Wikipedia |
| 🔗 Pipeline  | RAG (Retrieval-Augmented Generation) |

---

## 🛠️ Tech Stack

### Backend
- FastAPI, Uvicorn, Python  

### AI / ML
- Scikit-learn  
- LangChain  
- Groq (LLaMA 3.1)  

### Data Sources
- Tavily API  
- Wikipedia API  

### Frontend
- React.js  

---

## ⚙️ Configuration

Create a `.env` file:

```env
# API Keys
GROQ_API_KEY=YOUR_API_KEY
TAVILY_API_KEY=YOUR_API_KEY

# LLM Config
LLM_MODEL=llama-3.1-8b-instant
LLM_TEMPERATURE=0.0

# ML Config
ML_CONFIDENCE_THRESHOLD=20.0

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Logging
LOG_LEVEL=INFO

# Search Config
TAVILY_MAX_RESULTS=3
SCRAPE_MAX_CHARS=3000


📦 Installation

git clone https://github.com/your-username/medical-assistant-ai.git
cd medical-assistant-ai

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
uvicorn main:app --reload

🎯 Use Cases
🏥 Symptom-based disease prediction
🤖 AI medical chatbot
📚 Healthcare education tool
🔬 Medical research assistant
⚠️ Disclaimer

This project is for informational purposes only.
It does NOT replace professional medical advice.

🔮 Future Vision
🧬 PubMed & clinical dataset integration
🎙️ Voice-based assistant
📱 Mobile app
🔐 User profiles & history
📊 Explainable AI insights
🤝 Contributing

Contributions are welcome!
Fork → Improve → Pull Request 🚀

👨‍💻 Author

Your Name
🔗 GitHub: https://github.com/hs744413-ha

⭐ If you like this project

Give it a ⭐ on GitHub and support the project!

