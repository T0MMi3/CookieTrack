<a id="readme-top"></a>

<div align="center">
  <a href="https://github.com/T0MMi3/CookieTrack">
    <img src="public/resources/images/cookietrack_logo.png" alt="CookieTrack Logo" width="500" height="100">
  </a>

  <h3 align="center">CookieTrack</h3>

  <p align="center">
    A web app for Girl Scout troops to manage cookie sales, inventory, orders, and rewards.
    <br />
    <a href="/documentation/"><strong>Explore the docs »</strong></a>
    <br /><br />
    <a href="https://cookie-track.web.app">View Live Demo</a>
    &nbsp;·&nbsp;
    <a href="https://github.com/T0MMi3/CookieTrack/issues">Report Bug</a>
    &nbsp;·&nbsp;
    <a href="https://github.com/T0MMi3/CookieTrack/issues">Request Feature</a>
  </p>

  <br />

  [![Node.js][Node.js]][Node-url]
  [![Express][Express.js]][Express-url]
  [![Tailwind][TailwindCSS]][Tailwind-url]
  [![Firebase][Firebase]][Firebase-url]
  [![SendGrid][SendGrid]][SendGrid-url]
</div>

---

## Table of Contents

- [About The Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [Deploy to Firebase](#deploy-to-firebase-production)
    - [Seed Firestore Data](#seed-initial-firestore-data)
    - [Security Rules](#configure-firestore-security-rules)
    - [Local Development](#local-development)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---


<!-- ABOUT THE PROJECT -->
## About The Project

[![CookieTrack Screenshot][product-screenshot]](https://cookie-track.web.app/)

**CookieTrack** streamlines Girl Scout cookie sales management by tracking orders, inventory, and rewards. Troop leaders get full admin control while parents can manage their troopers' sales.

Other Girl Scout troops can run their own instance by cloning this repo and following the setup instructions below.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---



### Tech Stack

* [![Node][Node.js]][Node-url]
* [![Express][Express.js]][Express-url]
* [![Tailwind][TailwindCSS]][Tailwind-url]
* [![Firebase][Firebase]][Firebase-url]
* [![SendGrid][SendGrid]][SendGrid-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

### Features

#### Multi-Level Access Control
- **Troop Leader/Manager**: Full administrative access to manage inventory, rewards, and troop data
- **Parents**: Limited access to manage their troopers' orders and rewards
- A user is automatically assigned the parent role on signup. To grant leader access, manually set the user's role field to "leader" in Firestore

#### Inventory Management
- Track troop-level cookie inventory
- Manage parent and individual trooper inventory allocations
- Real-time inventory updates when orders are placed or fulfilled
- Need-to-order tracking system — grouped by cookie variety and summed across all orders for easy stock tallying

#### Order Management
- Submit and track cookie orders
- Support for both cash and card payments
- Order status tracking (Not ready for pickup, Ready for pickup, Picked up, Completed)
- Financial agreement and pickup location tracking
- Document/receipt upload per order via direct Firebase Storage upload

#### Reward System
- Leaders can create and manage reward tiers
- Automatic reward unlocking based on sales thresholds
- Multiple choice options for each reward
- Visual reward tracking interface

#### Sales Analytics
- Monthly suggested cookie of the month (configurable by month in dashboard.js)
- Revenue and inventory analytics
- Boxes sold statistics
- Orders completed tracking
- Amount owed calculations

#### User Features
- Dark mode support
- Mobile-responsive design
- Document upload capabilities
- Profile management

#### Technical Stack

- Frontend: HTML, CSS (Tailwind), JavaScript
- Backend: Node.js with Express
- Database: Firebase Firestore
- Authentication: Firebase Auth (Email/Password + Google)
- Storage: Firebase Storage (direct browser uploads for files, bypassing Cloud Run)
- Hosting: Firebase Hosting

#### Data Flow

1. Leader configures troop inventory with cookie varieties and stock
2. Parents place orders for specific troopers
3. Orders are processed against leader inventory — shortfalls are tracked in "Need To Order"
4. Leader fulfills need-to-order items and updates stock
5. Upon pickup confirmation, cookies transfer to parent and trooper inventory
6. Parents assign cookies to trooper inventory
7. Sales are tracked and rewards are automatically unlocked based on box thresholds

#### Security

- Role-based access control via Firebase custom claims
- Custom claims are attached on first login and refreshed without page reload
- Firestore security rules restrict user document creation to authenticated users with parent role only
- Firebase Storage rules restrict file access to the owning user
- Transaction-based inventory updates prevent race conditions
- Multipart file uploads go directly from browser to Firebase Storage (not through Cloud Run)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- GETTING STARTED -->
## Getting Started

To set up your own instance, complete the Prerequisites first, then follow the Installation steps.

### Prerequisites

Before installing, make sure you have:
- [Node.js](https://nodejs.org/) v18 or higher
- [Firebase CLI](https://firebase.google.com/docs/cli) — install with `npm install -g firebase-tools`
- A [Firebase project](https://console.firebase.google.com/) on the **Blaze (pay-as-you-go)** plan — required for Cloud Functions


---

### Installation

#### Step 1 — Clone & Install Dependencies

```bash
git clone https://github.com/T0MMi3/CookieTrack.git
cd CookieTrack
npm install
cd functions && npm install && cd ..
```

#### Step 2 — Enable Firebase Services

In the [Firebase Console](https://console.firebase.google.com/) for your project, enable:

| Service | Steps |
|---|---|
| **Firestore** | Build → Firestore Database → Create database → choose region → Production mode |
| **Authentication** | Build → Authentication → Get started → enable Email/Password |
| **Storage** | Build → Storage → Get started → use the same region as Firestore |
| **Functions** | Build → Functions → Get started |
| **Hosting** | Build → Hosting → Get started → use your project ID as the site name |

#### Step 3 — Generate a Service Account Key

1. Firebase Console → gear icon → **Project settings** → **Service accounts**
2. Click **Generate new private key** → confirm → a JSON file downloads
3. Keep this file safe — you'll copy values from it in the next step

#### Step 4 — Create `functions/.env`

Create a file at `functions/.env` and fill in each value from the downloaded JSON and your Firebase project settings:

```env
NODE_ENV="deployment"
COOKIETRACK_FIREBASE_TYPE="service_account"
COOKIETRACK_FIREBASE_PROJECT_ID="your-project-id"
COOKIETRACK_FIREBASE_PRIVATE_KEY_ID="from JSON: private_key_id"
COOKIETRACK_FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
COOKIETRACK_FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"
COOKIETRACK_FIREBASE_CLIENT_ID="from JSON: client_id"
COOKIETRACK_FIREBASE_AUTH_URI="https://accounts.google.com/o/oauth2/auth"
COOKIETRACK_FIREBASE_TOKEN_URI="https://oauth2.googleapis.com/token"
COOKIETRACK_FIREBASE_AUTH_PROVIDER_CERT_URL="https://www.googleapis.com/oauth2/v1/certs"
COOKIETRACK_FIREBASE_CLIENT_CERT_URL="https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com"
COOKIETRACK_FIREBASE_UNIVERSE_DOMAIN="googleapis.com"
COOKIETRACK_FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
COOKIETRACK_FIREBASE_API_KEY="your Web API key"
SENDGRID_API_KEY=""
```

> **Private Key Warning**: The `PRIVATE_KEY` must be the raw key value only — no JSON wrapper, no extra quotes. Keep all `\n` characters as literal `\n` on a single line. Do not add leading or trailing spaces to any field values, especially IDs — these will cause lookup failures throughout the app.

> The `COOKIETRACK_FIREBASE_DB_URL` line is intentionally omitted. Realtime Database is not used by this project.

Find your **Web API key**, **Messaging Sender ID**, and **App ID** under Project settings → General → scroll down to "Your apps". If no web app exists yet, click **Add app → Web** and register it.

#### Step 5 — Update Source Files

**`public/utils/auth.js`** — replace the `firebaseConfig` object:

```js
const firebaseConfig = {
    apiKey: "your Web API key",
    authDomain: "your-project-id.web.app",
    projectId: "your-project-id",
    storageBucket: "your-project-id.firebasestorage.app",
    messagingSenderId: "your Messaging Sender ID",
    appId: "your App ID"
};
```

**`.firebasesrc`** — replace the project reference:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

**`public/resources/pwa/site.webmanifest`** — replace all occurrences of `cookie-track` with your project ID.

**`firebase.json`** — remove the `"database"` section entirely if present (Realtime Database is not used).

#### Step 6 — Link Firebase CLI & Deploy

```bash
firebase login
firebase use your-project-id
firebase deploy
```

After deploying, go to **Firebase Console → Functions** → find the `api` function → copy its Cloud Run URL (format: `https://api-XXXXXXXX-uc.a.run.app`).

Update **`public/utils/apiCall.js`** with that URL:

```js
const PROD_URL = "https://api-XXXXXXXX-uc.a.run.app";
const MAIN_URL = PROD_URL;
```

Then redeploy hosting:

```bash
firebase deploy --only hosting
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---


### Seed Initial Firestore Data

After deploying, manually create these collections in the Firebase Console → Firestore:

#### `cookies` collection
Add one document per cookie variety your troop sells (auto-generate the document ID):

| Field | Type | Example |
|---|---|---|
| `variety` | string | `"Thin Mints"` |
| `boxPrice` | number | `6` |

#### `inventory` collection — document ID: `troop-inventory`

| Field | Type | Value |
|---|---|---|
| `inventory` | array | *(empty — add entries below)* |
| `needToOrder` | array | *(empty)* |

For the `inventory` array, add one map entry per cookie variety:

| Field | Type | Value |
|---|---|---|
| `varietyId` | string | *(copy exact document ID from `cookies` collection — no spaces)* |
| `variety` | string | `"Thin Mints"` |
| `boxPrice` | number | `6` |
| `boxes` | number | `0` |

#### Set the first Leader account

1. Sign up at `/login/sign-up.html` — your account will be created with the `parent` role
2. In Firestore → `users` → find your document → set `role` to `"leader"`
3. In the browser console on the site, run:
   ```js
   fetch('https://api-XXXXXXXX-uc.a.run.app/attachRoleAsCustomClaim/YOUR_UID', { method: 'POST' })
   ```
   (Find your UID in Firebase Console → Authentication → Users)
4. Sign out and back in — your leader role is now active

---

### Configure Firestore Security Rules

Replace the contents of `firestore.rules` with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow create: if request.auth != null
        && request.auth.uid == userId
        && request.resource.data.role == 'parent';
      allow read, update: if request.auth != null && request.auth.uid == userId;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

### Configure Firebase Storage Rules

Replace the contents of `storage.rules` with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    match /users/{userId}/documents/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /users/{userId}/profilePic/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /rewards/{rewardId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == 'leader';
    }

  }
}
```

Deploy the updated rules:

```bash
firebase deploy --only firestore,storage
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

### Local Development

1. **Preview Tailwind CSS changes:**
   ```bash
   # Root directory
   npm run dev
   ```

2. **Switch CORS to allow local testing** — in `functions/index.js`:
   ```js
   app.use(cors({
      // Testing only — uncomment this:
      origin: true

      // Production — comment this out for local testing:
      /*origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }*/
   }));
   ```

3. **Run the local backend:**
   ```bash
   cd functions
   npx nodemon index.js
   ```

4. **Point the frontend at localhost** — in `public/utils/apiCall.js`:
   ```js
   const PROD_URL = "https://api-XXXXXXXX-uc.a.run.app";
   const TEST_URL = "http://localhost:5000";
   const MAIN_URL = TEST_URL; // ← switch to TEST_URL for local dev
   ```

5. Run the frontend with a local server (e.g. VS Code **Live Server** extension).

6. **Deploy commands:**
   ```bash
   firebase deploy                     # Deploy everything
   firebase deploy --only hosting      # Frontend changes only (public/)
   firebase deploy --only functions    # Backend changes only (functions/)
   firebase deploy --only firestore    # Firestore rules/indexes only
   firebase deploy --only storage      # Storage rules only
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Usage

View a full demo from both the troop leader and parent perspectives [here](https://drive.google.com/file/d/1PnMRTYwfmUHfp8rzJ26goJ1rnOs44RZ_/view?usp=sharing).

View a simplified Firebase setup tutorial [here](https://drive.google.com/file/d/18CpQs2pBGZ9vdFoOWUBH5w-RNKWZLYxR/view?usp=sharing).

_For more information, refer to the [documentation](/documentation/)._

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Contributing

If you have a suggestion, please fork the repo and create a pull request, or open an issue with the tag `enhancement`.

1. Fork the project
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## License

Distributed under the Apache License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- MARKDOWN LINKS & IMAGES -->
[product-screenshot]: documentation/demo_screenshot.png
[Node.js]: https://img.shields.io/badge/node.js-000000?style=for-the-badge&logo=nodedotjs&logoColor=#5FA04E
[Node-url]: https://nodejs.org/en
[Express.js]: https://img.shields.io/badge/express.js-000000?style=for-the-badge&logo=express&logoColor=white
[Express-url]: https://expressjs.com/
[TailwindCSS]: https://img.shields.io/badge/tailwindcss-000000?style=for-the-badge&logo=tailwindcss&logoColor=#06B6D4
[Tailwind-url]: https://tailwindcss.com/
[Firebase]: https://img.shields.io/badge/firebase-000000?style=for-the-badge&logo=firebase&logoColor=#DD2C00
[Firebase-url]: https://firebase.google.com/
[SendGrid]: https://img.shields.io/badge/sendgrid-000000?style=for-the-badge&logo=sendgrid&logoColor=#51A9E3
[SendGrid-url]: https://sendgrid.com/en-us
