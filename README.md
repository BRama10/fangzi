# 房子 (Fangzi) - AI Symptom Assessment Assistant

<a href='https://fangzii.vercel.app'><img src='https://img.shields.io/badge/Live Demo-Fangzi-green'></a>

![Fangzi UI Screenshot](https://github.com/BRama10/fangzi/blob/main/assets/picture.png)

Fangzi (房子, meaning "house" in Chinese - a reference to the brilliant fictional Dr. House, MD) is a sophisticated AI-powered symptom assessment tool that combines modern artificial intelligence with methodical medical inquiry. Through a conversational interface, it helps users understand their symptoms while maintaining a careful, analytical approach to health assessment.

## ✨ Features

- **Interactive Symptom Assessment**: Engage in a systematic conversation about your symptoms
- **Differential Analysis**: Methodical questioning that adapts based on user responses
- **Comprehensive Results**: 
  - Evidence-based condition analysis
  - Recommended treatments and medications
  - Doctor visit recommendations
  - Expected recovery timelines
- **User-friendly Interface**:
  - Modern, clean design
  - Quick-select common symptoms
  - Severity scale ratings
  - Smooth animations and transitions

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/BRama10/fangzi.git
cd fangzi
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Add your OpenAI API key to the `.env` file:
```
OPENAI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

- **Frontend**:
  - Next.js 14
  - React
  - TypeScript
  - Tailwind CSS
  - Shadcn/UI
  - Lucide Icons

- **AI Integration**:
  - OpenAI GPT-4
  - Custom prompt engineering
  - Structured response handling

## ⚠️ Important Disclaimer

Fangzi is designed as a preliminary symptom assessment tool only. It:
- Is not a replacement for professional medical advice
- Should not be used for emergency medical situations
- Does not diagnose conditions
- Should be used as a supplementary tool only

Always consult qualified healthcare professionals for medical advice and treatment.

## 🔒 Privacy

- No personal health information is stored
- All conversations are ephemeral
- API communications are encrypted
- No tracking or analytics implemented

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛣️ Roadmap

- [ ] Multi-language support
- [ ] Symptom history tracking
- [ ] Medication interaction checks
- [ ] Integration with medical knowledge bases
- [ ] Export functionality for doctor visits
- [ ] Mobile app version

---

*"Everybody lies." - The key to thorough symptom assessment is asking the right questions.*

