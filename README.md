# 🚀 Intervexa-AI

> **AI-Powered Interview Preparation Platform**

Intervexa-AI is a web-based interview preparation platform designed to help students and job seekers improve their **aptitude, coding, interview, and job-search skills** in one place.

The platform provides an interactive learning experience with AI-powered interview assistance, coding practice, aptitude tests, profile analysis, and personalized progress tracking.

## 🌐 Live Demo

🔗 **[Try Intervexa-AI](https://kabishs.github.io/Intervexa-AI/)**

🔗 **[GitHub Repository](https://github.com/kabishS/Intervexa-AI)**

---

## ✨ Features

### 🎯 Aptitude Practice

* Practice aptitude questions.
* Multiple-choice questions.
* Instant score calculation.
* Track your aptitude performance.

### 💻 Coding Practice

* Solve programming challenges.
* Practice coding concepts.
* Track coding performance.
* Improve problem-solving skills.

### 🤖 AI Interview

* AI-powered mock interview experience.
* Generate interview questions dynamically.
* Get AI-based feedback on answers.
* Practice technical and HR interview questions.

### 💼 Job Search

* Search for available job opportunities.
* Explore relevant positions.
* Keep track of job applications.

### 👤 Profile Analysis

* Analyze your profile.
* Track your preparation progress.
* View performance across different modules.

### 📊 Progress Dashboard

* Aptitude score
* Coding score
* Interview score
* Job application history
* Overall preparation progress

### 💾 Local Data Storage

* Uses browser `localStorage` for client-side data persistence.
* Stores user progress and selected application data locally.

---

## 🛠️ Technology Stack

| Technology   | Purpose                             |
| ------------ | ----------------------------------- |
| HTML5        | Website structure                   |
| CSS3         | Styling and responsive UI           |
| JavaScript   | Application logic and interactivity |
| Bootstrap    | Responsive UI components            |
| Groq API     | AI-powered interview functionality  |
| Web APIs     | Browser-based functionality         |
| LocalStorage | Client-side data storage            |
| Git          | Version control                     |
| GitHub       | Source code hosting                 |
| GitHub Pages | Deployment                          |

---

## 🏗️ Project Structure

```text
Intervexa-AI/
│
├── .github/
│   └── workflows/
│
├── assets/
│   ├── images/
│   └── other assets
│
├── css/
│   └── style.css
│
├── html/
│   ├── aptitude.html
│   ├── coding.html
│   ├── interview.html
│   ├── jobs.html
│   └── profile.html
│
├── js/
│   ├── aptitude.js
│   ├── coding.js
│   ├── interview.js
│   ├── jobs.js
│   └── profile.js
│
├── index.html
└── README.md
```

> The exact files inside the `html`, `css`, and `js` directories may change as the project evolves.

---

## 🔄 Application Flow

```text
                    ┌──────────────────┐
                    │    Intervexa-AI  │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
         Aptitude         Coding        AI Interview
              │              │              │
              └──────────────┼──────────────┘
                             │
                             ▼
                       Performance
                         Tracking
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
          Profile          Jobs         Progress
          Analysis        Search        Dashboard
```

---

## 🤖 AI Interview Module

The AI Interview module is one of the core features of Intervexa-AI.

The system can:

1. Ask interview questions.
2. Accept the user's response.
3. Send relevant information to the AI service.
4. Analyze the response.
5. Generate feedback.
6. Help the user identify areas for improvement.

This provides a realistic environment for practicing interviews before attending real interviews.

---

## 💾 Data Management

Intervexa-AI uses browser-based storage for selected user data.

```javascript
localStorage.setItem("interviewScore", score);

const score = localStorage.getItem("interviewScore");
```

This allows users to retain preparation data between browser sessions without requiring a traditional backend database.

---

## 🔐 API Configuration

If the AI interview functionality requires an API key, configure the API according to the implementation in the project.

### ⚠️ Security

**Never commit a real API key to GitHub.**

Avoid:

```javascript
const API_KEY = "your-real-api-key";
```

For production applications, API keys should be protected through a backend/server-side environment rather than exposing them directly in frontend JavaScript.

---

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/kabishS/Intervexa-AI.git
```

### 2. Open the project

```bash
cd Intervexa-AI
```

### 3. Start the application

Since this is a frontend web application, you can open:

```text
index.html
```

You can also use **VS Code Live Server** for a better development experience.

### 4. Open in browser

```text
http://127.0.0.1:5500/
```

---

## 📱 Responsive Design

Intervexa-AI is designed to work across:

* 💻 Desktop
* 💻 Laptop
* 📱 Mobile
* 📱 Tablet

Bootstrap and responsive CSS techniques are used to create a flexible interface.

---

## 🎯 Project Goals

The main goals of Intervexa-AI are to:

* Help students prepare for placements.
* Provide an all-in-one interview preparation platform.
* Combine aptitude and coding practice.
* Provide AI-powered interview practice.
* Track preparation progress.
* Help users identify their strengths and weaknesses.
* Make interview preparation accessible from a browser.

---

## 🔮 Future Improvements

Planned improvements include:

* [ ] Advanced AI interview evaluation
* [ ] Voice-based AI interviews
* [ ] Resume analysis
* [ ] Personalized interview questions
* [ ] Advanced analytics dashboard
* [ ] More coding problems
* [ ] More aptitude categories
* [ ] User authentication
* [ ] Cloud database integration
* [ ] Job application tracking
* [ ] Interview history
* [ ] AI-generated learning roadmap
* [ ] Dark mode
* [ ] PWA/mobile support

---

## 🧪 Testing

The project can be tested manually across:

* Login/user flow
* Aptitude questions
* Coding challenges
* AI interview
* Profile dashboard
* Job search
* LocalStorage persistence
* Responsive layouts

For browser automation, tools such as **Playwright** can be used to automate important user journeys.

---

## 📸 Screenshots

Add screenshots of the major modules here:

```text
screenshots/
├── home.png
├── aptitude.png
├── coding.png
├── interview.png
├── jobs.png
└── dashboard.png
```

Example:

### 🏠 Home

![Intervexa-AI Home](screenshots/home.png)

### 🤖 AI Interview

![AI Interview](screenshots/interview.png)

### 📊 Dashboard

![Dashboard](screenshots/dashboard.png)

---

## 👨‍💻 Developer

### Kabish S

B.Tech Information Technology Student
VSB College of Engineering Technical Campus

**Focus:** Java Full Stack Development | AI Applications | Software Testing

### Connect With Me

* 🌐 Portfolio: [kabish-web.netlify.app](https://kabish-web.netlify.app/)
* 💻 GitHub: [github.com/kabishS](https://github.com/kabishS)
* 🔗 LinkedIn: [linkedin.com/in/kabish](https://linkedin.com/in/kabish)

---

## ⭐ Support

If you find **Intervexa-AI** useful:

⭐ Star the repository
🍴 Fork the project
🐛 Report issues
💡 Suggest new features

---

## 📄 License

This project is available for educational and personal development purposes.

---

<p align="center">

### 🚀 Prepare Better. Practice Smarter. Interview Confidently.

**Built with ❤️ by Kabish S**

</p>
