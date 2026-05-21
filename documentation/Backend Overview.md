<a id="readme-top"></a>

# 🍪 CookieTrack – Web App Backend

<!-- TABLE OF CONTENTS -->
<details style="cursor: pointer">
   <summary>Table of Contents</summary>
   <ol>
      <li><a href="#🔍-overview">🔍 Overview</a></li>
      <li><a href="#🛠-tech-stack">🛠 Tech Stack</a></li>
      <li><a href="#🗂️-directory-structure">🗂️ Directory Structure</a></li>
      <li><a href="#🏛-architecture">🏛 Architecture</a></li>
      <li><a href="#🔄-request-data-flow">🔄 Request Data Flow</a></li>
      <li>
         <a href="#🚀-getting-started">🚀 Getting Started</a> 
         <ul>
            <li><a href="#⚙️-install-dependencies">⚙️ Install Dependencies</a></li>
            <li><a href="#▶️-start-development-server">▶️ Start Development Server</a></li>
            <li><a href="#☁️-deploy-to-firebase-functions">☁️ Deploy to Firebase Functions</a></li>
         </ul>
      </li>
      <li><a href="#📌-final-notes">📌 Final Notes</a></li>
   </ol>
</details>


---

## 🔍 Overview

The backend service handles all server-side operations including:
- User Authentication & Authorization  
- Cookie Inventory Management  
- Order Processing  
- File Storage  
- Notifications  
- Analytics  

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🛠 Tech Stack

- Node.js v22  
- Express.js v4.21.2  
- Firebase Functions v6.3.0  
- Firebase Admin SDK v12.7.0  
- Firebase Client SDK v11.2.0  
- Axios ^1.7.9  
- Bcrypt ^5.1.1  
- CORS ^2.8.5  
- Dotenv ^16.4.7  
- JSON Web Token ^9.0.2  
- Multer ^1.4.5-lts.1  
- XSS ^1.0.15  
- SendGrid Mail ^8.1.4  
- Nodemailer ^6.10.0  
- Express Rate Limit ^7.5.0  
- Nodemon ^3.1.9  

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🗂️ Directory Structure

```plaintext
functions/
├── dataFormat.js           # Data formatting utilities
├── firebaseConfig.js       # Firebase configuration and initialization
├── index.js                # Entry point: Express app setup
├── controllers/
│   ├── authController.js
│   ├── cookieController.js
│   ├── documentController.js
│   ├── inventoryController.js
│   ├── orderController.js
│   ├── rewardController.js
│   ├── saleController.js
│   ├── trooperController.js
│   └── userController.js
├── routes/
│   ├── authRoute.js
│   ├── cookieRoute.js
│   ├── documentRoute.js
│   ├── inventoryRoute.js
│   ├── orderRoute.js
│   ├── rewardRoute.js
│   ├── saleRoute.js
│   ├── trooperRoute.js
│   └── userRoute.js
├── services/
│   ├── authService.js
│   ├── cookieService.js
│   ├── documentService.js
│   ├── inventoryService.js
│   ├── orderService.js
│   ├── rewardService.js
│   ├── saleService.js
│   ├── notificationService.js
│   └── userService.js
├── utils/
│   ├── calculation.js
│   ├── emailSender.js
│   ├── fileUpload.js
│   ├── logger.js
│   ├── roleCheck.js
│   └── scheduler.js
└── package.json

```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🏛 Architecture

The backend follows a modular microservice architecture pattern designed to keep each domain logical and decoupled:
- **Order Service**: Manages order processing and tracking  
- **Inventory Service**: Controls cookie inventory and stock levels  
- **Reward Service**: Handles scout rewards and achievements  
- **Notification Service**: Manages email and other notification delivery  
- **Document Service**: Handles file uploads and document management  

Each service:
- Has its own data model and business logic  
- Communicates through well-defined APIs  
- Can be deployed and scaled independently  
- Maintains its own Firestore collections  
- Adheres to the Single Responsibility Principle  

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🔄 Request Data Flow

```plaintext
POST /order
↓
Route: orderRoute.js
- Validates JWT token
↓
Controller: orderController.js
- Validates request payload
↓
Service: orderService.js
  - Checks stock availability
  - Creates or updates order record
  - Calculates totals
  - Updates cookie inventory
  - Sends order confirmation
```
  
<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🚀 Getting Started

### ⚙️ Install Dependencies

```bash
npm install
```

### ▶️ Start Development Server

```bash
npm run dev
```

### ☁️ Deploy to Firebase Functions

```bash
firebase deploy --only functions
```
  
<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 📌 Final Notes

CookieTrack is designed with flexibility, usability, and clarity in mind — built for troop leaders, parents, and the complex logistics of cookie season.  
The codebase is easy to extend and modify for additional features or new user roles.

> Built for troops. Built for parents. Built for cookies.

<p align="right">(<a href="#readme-top">back to top</a>)</p>