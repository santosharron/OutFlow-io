# 🚀 OutFlo Assignment - LinkedIn Outreach Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)

> **A comprehensive LinkedIn outreach automation platform with campaign management, AI-powered message generation, and automated profile scraping.**


---

## 🌐 **Live Application**

**🚀 [OutFlo - Live Demo](https://out-flow-io.vercel.app/)**

## 🎬 **Demo Video**

**📹 [Watch Full Demo Video](https://drive.google.com/file/d/1--IZwGEP3wqeBIDvUdGMMIwtv6bH6FSv/view?usp=sharing)**
**🎥 [LinkedIn Profile Scraping Demo Video](https://www.loom.com/share/686c177b600749379d59e4cbfcf9d13a?sid=0e7d5827-5fef-40f4-bea6-f1e71a0bde51)

**What the demo covers:**
- Complete application walkthrough
- LinkedIn profile scraping in action
- Campaign creation and lead management
- AI message generation
- Export functionality
- Responsive design showcase

---

## 🎯 **Assignment Completion Status**

### ✅ **Core Requirements (100% Complete)**
- **Backend**: Node.js + Express + TypeScript + MongoDB
- **Campaign CRUD APIs**: Full implementation with status management
- **LinkedIn Message API**: AI-powered personalized message generation
- **Frontend**: React + TypeScript with responsive UI
- **Campaign Management UI**: Dashboard, forms, status toggles
- **Message Generator UI**: Complete form with AI integration

### 🏆 **Bonus Task (100% Complete)**
- **LinkedIn Profile Scraping**: Playwright-based automated scraping
- **UI Integration**: Seamless profile management and search
- **Database Storage**: Complete profile data persistence
- **Lead Management**: Add scraped profiles to campaigns

### 🚀 **Extra Features (Beyond Requirements)**
- **Profile Scraper UI**: Advanced scraping interface with real-time progress
- **Bulk Operations**: Select and add multiple profiles to campaigns
- **Export Functionality**: CSV export for profiles and campaigns
- **Advanced Filtering**: Search by name, company, location
- **Message Variations**: Generate multiple message versions
- **Real-time Feedback**: Toast notifications and loading states
- **Professional UI/UX**: Modern, responsive design with Tailwind CSS

---

## 📁 **Project Structure**

```
outflo-assignment/
├── backend/                 # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Business logic & AI/scraping services
│   │   ├── middleware/      # Error handling, validation
│   │   └── index.ts         # Server entry point
│   ├── dist/               # Compiled JavaScript
│   └── package.json
├── frontend/               # React + TypeScript
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── services/       # API integration
│   │   ├── types/          # TypeScript type definitions
│   │   └── App.tsx         # Main React component
│   └── package.json
└── README.md
```

---

## 🛠 **Setup & Installation**

### **Prerequisites**
- Node.js (v18+)
- MongoDB (local or Atlas)
- Git

### **Quick Start**

1. **Clone the repository**
```bash
git clone https://github.com/your-username/OutFlo-Assignment.git
cd OutFlo-Assignment
```

2. **Backend Setup**
```bash
cd backend
npm install
npm run build
npm start
```

3. **Frontend Setup** (new terminal)
```bash
cd frontend
npm install
npm start
```

4. **Environment Variables**
Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/outflo
OPENAI_API_KEY=your_openai_key_here  # Optional - uses fallback if not provided
NODE_ENV=development
```

### **Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

---

## 📚 **API Documentation**

### **Campaign APIs**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaigns` | Fetch all active campaigns |
| GET | `/api/campaigns/:id` | Fetch single campaign |
| POST | `/api/campaigns` | Create new campaign |
| PUT | `/api/campaigns/:id` | Update campaign |
| DELETE | `/api/campaigns/:id` | Soft delete campaign |

**Campaign Schema:**
```typescript
{
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  leads: string[];        // LinkedIn profile URLs
  accountIDs: string[];   // Account identifiers
  createdAt: Date;
  updatedAt: Date;
}
```

### **Message Generation APIs**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/personalized-message` | Generate AI message |
| POST | `/api/personalized-message/variations` | Generate message variations |

**Message Request:**
```typescript
{
  name: "John Doe";
  job_title: "Software Engineer";
  company: "TechCorp";
  location: "San Francisco, CA";    // Optional
  summary: "AI/ML specialist...";   // Optional
}
```

### **Profile Scraping APIs**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profiles` | Fetch all profiles |
| POST | `/api/profiles/scrape` | Scrape LinkedIn profiles |
| DELETE | `/api/profiles/:id` | Delete profile |

---

## 💡 **Key Features**

### 🎯 **Campaign Management**
- **Complete CRUD Operations**: Create, read, update, delete campaigns
- **Status Management**: Active/Inactive/Deleted with proper filtering
- **Lead Management**: Add LinkedIn profiles as leads to campaigns
- **Bulk Operations**: Select multiple profiles and add to campaigns
- **Export Functionality**: Download campaign data as CSV

### 🤖 **AI Message Generation**
- **Personalized Messages**: Context-aware LinkedIn outreach messages
- **Multiple Variations**: Generate different versions of messages
- **Custom Instructions**: Add specific context or requirements
- **Tone Selection**: Professional, casual, friendly, formal
- **Fallback System**: Works without OpenAI API key using templates

### 🔍 **LinkedIn Profile Scraping**
- **Automated Extraction**: Playwright-based browser automation
- **Rich Data Capture**: Name, job title, company, location, profile URL, photos
- **Human-like Behavior**: Rate limiting and realistic browsing patterns
- **Manual Login**: Secure authentication without storing credentials
- **Real-time Progress**: Live updates during scraping process
- **Robust Error Handling**: Graceful failure recovery

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Feedback**: Toast notifications and loading states
- **Advanced Filtering**: Search by multiple criteria
- **Bulk Selection**: Checkbox-based multi-selection
- **Modal Interfaces**: Clean, focused user interactions
- **Professional Styling**: Tailwind CSS with consistent design system

---

## 🧪 **Testing Guide**

### **1. Campaign Management**
1. Visit http://localhost:3000/campaigns
2. Create a new campaign with sample data
3. Edit campaign details and toggle status
4. Export campaign data to CSV

### **2. Profile Scraping**
1. Visit http://localhost:3000/profile-scraper
2. Enter LinkedIn search URL (sample provided)
3. Click "Start Scraping" and login manually
4. Watch real-time progress and results

### **3. Message Generation**
1. Visit http://localhost:3000/message-generator
2. Fill in profile details (sample data provided)
3. Generate personalized message
4. Try different tones and variations

### **4. Lead Management**
1. Visit http://localhost:3000/profiles
2. Select multiple scraped profiles
3. Click "Add to Campaign"
4. Choose target campaign and confirm

--- 

## 🚀 **Deployment**

### **Backend (Render/Railway)**
```bash
# Build command
npm run build

# Start command
npm start

# Environment variables
MONGODB_URI=your_mongodb_atlas_url
OPENAI_API_KEY=optional_openai_key
NODE_ENV=production
```

### **Frontend (Vercel/Netlify)**
```bash
# Build command
npm run build

# Environment variables
REACT_APP_API_URL=your_backend_url
```

---

## 🏆 **Why This Exceeds Requirements**

### **Technical Excellence**
- **TypeScript Throughout**: Complete type safety in both frontend and backend
- **Modern Architecture**: Clean separation of concerns, proper error handling
- **Database Design**: Efficient MongoDB schemas with proper indexing
- **API Design**: RESTful endpoints with comprehensive validation

### **Feature Completeness**
- **100% Requirements Met**: Every specification implemented and working
- **Bonus Task Complete**: Full LinkedIn scraping with UI integration
- **Extra Features**: Export, bulk operations, message variations, advanced filtering

### **User Experience**
- **Professional UI**: Modern, responsive design using Tailwind CSS
- **Real-time Feedback**: Loading states, progress indicators, toast notifications
- **Error Handling**: Graceful error recovery with user-friendly messages
- **Accessibility**: Proper labels, keyboard navigation, screen reader support

### **Production Ready**
- **Environment Configuration**: Proper env var management
- **Error Monitoring**: Comprehensive logging and error tracking
- **Security**: Input validation, secure API design
- **Performance**: Optimized queries, efficient data handling

---

## 🔗 **Live Demo**

- **Frontend**: [https://out-flow-io.vercel.app/](https://out-flow-io.vercel.app/)
- **Backend API**: [https://outflow-io.onrender.com/api](https://outflow-io.onrender.com/api)
- **Health Check**: [https://outflow-io.onrender.com/health](https://outflow-io.onrender.com/health)
- **GitHub Repository**: https://github.com/Temp-insta/OutFlow-io

---


## 📄 **License**

This project is created for assignment evaluation purposes for OutFlo.

---

*Built with ❤️ using React, Node.js, TypeScript, and MongoDB* 