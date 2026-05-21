<a id="readme-top"></a>

# 🍪 CookieTrack – Web App Frontend

<!-- TABLE OF CONTENTS -->
<details style="cursor: pointer">
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#🍪-cookietrack--web-app-frontend">🍪 CookieTrack – Web App Frontend</a></li>
    <li><a href="#🗂️-directory-structure">🗂️ Directory Structure</a></li>
    <li><a href="#🔐-authentication--user-management">🔐 Authentication & User Management</a></li>
    <li><a href="#📊-dashboard">📊 Dashboard</a></li>
    <li>
      <a href="#📦-inventory-management">📦 Inventory Management</a>
      <ul>
        <li><a href="#👩‍✈️-leader-features">👩‍✈️ Leader Features</a></li>
        <li><a href="#👨‍👩‍👧-parent-features">👨‍👩‍👧 Parent Features</a></li>
      </ul>
    </li>
    <li>
      <a href="#🧾-order-management">🧾 Order Management</a>
      <ul>
        <li><a href="#🔁-order-workflow">🔁 Order Workflow</a></li>
        <li><a href="#🧾-order-statuses">🧾 Order Statuses</a></li>
        <li><a href="#💳-core-features">💳 Core Features</a></li>
      </ul>
    </li>
    <li>
      <a href="#🧍‍♀️-troop--rewards">🧍‍♀️ Troop & Rewards</a>
      <ul>
        <li><a href="#🎖️-trooper-management">🎖️ Trooper Management</a></li>
        <li><a href="#🏆-reward-system">🏆 Reward System</a></li>
      </ul>
    </li>
    <li>
      <a href="#🧰-utilities">🧰 Utilities</a>
      <ul>
        <li><a href="#🔌-api--auth">🔌 API & Auth</a></li>
        <li><a href="#🧱-ui-components">🧱 UI Components</a></li>
        <li><a href="#⚙️-data-utilities">⚙️ Data Utilities</a></li>
      </ul>
    </li>
    <li>
      <a href="#📁-file-overview">📁 File Overview</a>
      <ul>
        <li><a href="#🔤-html-entry-points">🔤 HTML Entry Points</a></li>
        <li><a href="#💻-javascript-modules">💻 JavaScript Modules</a></li>
        <li><a href="#🎨-styling-and-assets">🎨 Styling and Assets</a></li>
      </ul>
    </li>
    <li>
      <a href="#⚙️-technical-implementation">⚙️ Technical Implementation</a>
      <ul>
        <li><a href="#🧠-state-management">🧠 State Management</a></li>
        <li><a href="#🔄-data-flow">🔄 Data Flow</a></li>
        <li><a href="#⚠️-error-and-loading-states">⚠️ Error and Loading States</a></li>
      </ul>
    </li>
    <li><a href="#🔐-security-practices">🔐 Security Practices</a></li>
    <li>
      <a href="#✅-best-practices">✅ Best Practices</a>
      <ul>
        <li><a href="#🛠-usage-guidelines">🛠 Usage Guidelines</a></li>
        <li>
          <a href="#🔁-common-workflows">🔁 Common Workflows</a>
          <ul>
            <li><a href="#➕-adding-a-new-order">➕ Adding a New Order</a></li>
            <li><a href="#📥-managing-inventory">📥 Managing Inventory</a></li>
            <li><a href="#🏅-managing-rewards">🏅 Managing Rewards</a></li>
          </ul>
        </li>
      </ul>
    </li>
    <li><a href="#📌-final-notes">📌 Final Notes</a></li>
  </ol>
</details>

---

## 🗂️ Directory Structure

```plaintext
/public
├── dashboard           → Sales analytics and performance metrics
├── inventory           → Cookie inventory operations
├── login               → Authentication and access control
├── orders              → Order processing and payment tracking
├── resources           → Images, icons, and PWA assets
├── troop               → Trooper management and reward systems
├── user                → Account settings and user details
├── utils               → Shared utilities and components
├── 404.html            → Used for showing unfound pages to users
├── main.css            → Tailwind compiled CSS code (don't touch)
├── offline.html        → Used by service-worker.js when user doesn't have internet
└── service-worker.js   → Used to handle PWA installation and offline access
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🔐 Authentication & User Management

- **Firebase Auth** for login, registration, and password recovery  
- **Role-based access control** (Leader / Parent)  
- **Session persistence** using `sessionStorage`  
- **User profile settings** and account management  

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 📊 Dashboard

- **Monthly sales and revenue insights**  
- **Real-time inventory status**  
- **Troop performance visualizations**    

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 📦 Inventory Management

### 👩‍✈️ Leader Features
- Add/edit cookie varieties  
- Manage troop-wide inventory  
- Track "need to order" quantities  
- View parent and trooper inventories  

### 👨‍👩‍👧 Parent Features
- View troop inventory  
- Manage personal inventory  
- Assign cookies to troopers  
- Track amounts owed  

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🧾 Order Management

### 🔁 Order Workflow  
1. Parent places an order for a specific trooper  
2. System checks troop inventory  
3. If stock is sufficient: Marked as **Ready for Pickup**  
4. If not: Added to **Need-to-Order** list  
5. Parent picks up the order  
6. Parent logs payment (cash/card)  
7. Order is marked **Completed** when fully paid  

### 🧾 Order Statuses  
- **Not Ready for Pickup**  
- **Ready for Pickup**  
- **Picked Up**  
- **Completed**

### 💳 Core Features  
- Order creation  
- Pickup location management  
- Payment tracking and financial agreement handling
- Document uploading for receipts or other files  

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🧍‍♀️ Troop & Rewards

### 🎖️ Trooper Management  
- Add and update trooper profiles  
- Track individual sales and inventory  
- View complete order histories  

### 🏆 Reward System  
- Create reward tiers based on cookie boxes sold  
- Assign multiple reward options per tier  
- Unlocking is automatic  
- Visual progress tracking  
- Support for reward redemption  

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🧰 Utilities

### 🔌 API & Auth
- `apiCall.js` — universal API handler  
- `auth.js` — authentication utilities  

### 🧱 UI Components
- `confirmModal.js` — confirmation dialogs  
- `headerNav.js` / `sidebarNav.js` — navigation menus  
- `loader.js` — loading animations  
- `toasts.js` — toast notification system  
- `darkMode.js` — theme toggling logic  

### ⚙️ Data Utilities
- `tables.js` — dynamic table rendering  
- `utils.js` — general helper functions  
- `skeletons.js` — animated loading placeholders  

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 📁 File Overview

### 🔤 HTML Entry Points  
- `dashboard.html`  
- `inventory.html`
- `forgot-pass.html`
- `sign-in.html`
- `sign-up.html`
- `terms.html`  
- `orders.html`  
- `troopers.html`  
- `rewards.html`  
- `account.html`

### 💻 JavaScript Modules  
- `dashboard.js`  
- `inventory.js`
- `forgot-pass.js`
- `sign-in.js`
- `sign-up.js`  
- `orders.js`
- `uploadFiles.js`  
- `troopers.js`  
- `rewards.js`  
- `account.js`

### 🎨 Styling and Assets  
- `main.css` — core styling compiled by tailwind
- `root/src/main.css` — custom css
- `root/tailwind.config.js` — custom tailwind themes and variables  
- `/resources/images/` — icons and cookie-related visuals  
- `/resources/pwa/` — PWA manifest and service worker  

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## ⚙️ Technical Implementation

### 🧠 State Management  
- User role and context stored in `sessionStorage`  
- Inventory and order state synced with backend  

### 🔄 Data Flow  
1. User triggers action in UI  
2. JS function sends API call  
3. Firebase Functions process backend logic  
4. Response updates frontend dynamically  
5. Toasts or UI feedback are shown  

### ⚠️ Error and Loading States  
- Input validation  
- Graceful error displays  
- Skeleton screens while loading  
- Offline fallback - need to reconnect to use app  

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🔐 Security Practices

- Firebase Authentication  
- Role-based view access  
- Client-side access checks  
- Input sanitation  
- HTTPS-secured endpoints  

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## ✅ Best Practices

### 🛠 Usage Guidelines  
- Always validate roles before executing sensitive operations  
- Use confirmation modals before destructive actions  
- Show loading indicators during async operations  
- Display error messages clearly  

### 🔁 Common Workflows

#### ➕ Adding a New Order  
1. Select trooper  
2. Fill in buyer info  
3. Enter cookie amounts  
4. Choose payment type  
5. Agree to financial terms  
6. Submit order  

#### 📥 Managing Inventory  
1. View troop inventory  
2. Adjust quantities  
3. Transfer boxes as needed  
4. Monitor need-to-order list  

#### 🏅 Managing Rewards  
1. Set reward tiers and box thresholds  
2. Upload reward options and images  
3. Track unlocked and redeemed rewards  

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 📌 Final Notes

CookieTrack is designed with flexibility, usability, and clarity in mind — built for troop leaders, parents, and the complex logistics of cookie season.  
The codebase is easy to extend and modify for additional features or new user roles.

> Built for troops. Built for parents. Built for cookies.

<p align="right">(<a href="#readme-top">back to top</a>)</p>