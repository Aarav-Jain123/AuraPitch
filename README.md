
View our app: [AuraPitch — Turning Nervous Speakers into Strategic Communicators](https://aurapitch-b9dba.web.app/)

# AuraPitch

**AuraPitch** is a real-time AI coach designed to help you master the art of public speaking, ace interviews, and deliver winning pitches. By combining advanced computer vision and vocal analysis powered by **Gemini 2.0 Flash**, AuraPitch provides instantaneous feedback on your performance, helping you refine your presence and communication style.

## 🚀 Features

- **Real-time AI Coaching**: Receive live feedback on your tone, pace, and body language as you practice.
- **Multimodal Analysis**: Powered by Gemini 2.0 Flash to analyze both video frames and audio streams simultaneously.
- **Detailed Session Reports**: Get comprehensive performance breakdowns, including confidence scores, pacing charts, and AI-generated suggestions for improvement.
- **Interactive Practice Environment**: A distraction-free practice mode with a live teleprompter and real-time enthusiasm/confidence meters.
- **Performance Tracking**: Visualize your progress over time with data-driven insights and historical session data.

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4.
- **Backend**: Node.js, Express.
- **AI Engine**: Google Gemini 2.0 Flash (Multimodal Live API via `@google/genai`).
- **Data Visualization**: Recharts for performance analytics.
- **Animations**: Framer Motion for a fluid and high-end user experience.
- **Icons**: Lucide React.
- **Real-time Communication**: WebSockets for seamless low-latency interaction with the AI.

## 🔑 Environment Variables

To run AuraPitch, you need to configure the following environment variable:

```env
GEMINI_API_KEY=your_google_ai_studio_api_key
```

## 📦 Getting Started (If you want to run this locally)

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/aurapitch.git
    cd aurapitch
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up your environment variables:
    Create a `.env` file in the root directory and add your `GEMINI_API_KEY`.

4.  Start the development server:
    ```bash
    npm run dev
    ```

5.  Open your browser and navigate to `http://localhost:3000`.

## 🛡️ Permissions

AuraPitch requires the following permissions to function correctly:

- **Camera**: For body language and facial expression analysis.
- **Microphone**: For vocal tone and pacing analysis.

## 📄 License

This project is licensed under the MIT License.
