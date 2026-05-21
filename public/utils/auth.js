import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js';
import { callApi } from "../utils/apiCall.js";
import { handleSkeletons } from './skeletons.js';
import { imageStorageHandler } from './utils.js';

const firebaseConfig = {

  apiKey: "AIzaSyBgBE8dmkKModh0c-0g_dP6Z8zmEFsfkK0",
  authDomain: "cookie-track.firebaseapp.com",
  projectId: "cookie-track",
  storageBucket: "cookie-track.firebasestorage.app",
  messagingSenderId: "331617037885",
  appId: "1:331617037885:web:f2c2afce4cca22b1b2c454",
  measurementId: "G-8L07LF93E6",
  databaseURL: "https://cookie-track-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const allowedNotLoggedInURLs = [
    "/login/sign-in",
    "/login/sign-up",
    "/login/forgot-pass",
    "/login/terms"
]

onAuthStateChanged(auth, async (user) => {
    if (user) {
        if (window.location.href.includes("/login/sign-in") && !localStorage.getItem("creatingAccount")) {
            window.location.href = "../dashboard/dashboard.html";
        }

        if (sessionStorage.getItem("userData") === null && localStorage.getItem('creatingAccount') === null) {
            const sidebar = document.getElementById('sidebar');
            const shrunkSidebar = document.getElementById('shrunk-sidebar');
            if (!sidebar && !shrunkSidebar) return;

            try {
                handleSkeletons.hideNeedSkeletons(sidebar);
                handleSkeletons.hideNeedSkeletons(shrunkSidebar);
                handleSkeletons.sidebarSkeleton(sidebar.querySelector('.need-skeleton').parentElement, false);
                handleSkeletons.sidebarSkeleton(shrunkSidebar.querySelector('.need-skeleton').parentElement, true);

                const userData = await callApi(`/user/${user.uid}`, 'GET', null, true, user);

                // Attach custom claim if needed, then force token refresh — no reload needed
                const userRole = await callApi(`/getRole/${user.uid}`);

                if (userData.role && (!userRole || userRole.role !== userData.role)) {
                    await callApi(`/attachRoleAsCustomClaim/${user.uid}`, 'POST', null, false);
                    await user.getIdToken(true);
                }

                if (!localStorage.getItem('profilePic')) {
                    if (userData.profilePic) {
                        localStorage.setItem('profilePic', userData.profilePic);
                    }
                }

                if (userData && userRole) {
                    sessionStorage.setItem("userData", JSON.stringify(userData));
                    sessionStorage.setItem("userRole", JSON.stringify(userRole));
                }

                handleSkeletons.removeSkeletons(sidebar);
                handleSkeletons.removeSkeletons(shrunkSidebar);
                updateSidebarWithUserData();
            } catch (error) {
                console.error("Error fetching user data: ", error);
            }
        }

        document.dispatchEvent(new CustomEvent("authStateReady"));
    } else {
        if (!allowedNotLoggedInURLs.some(url => window.location.href.includes(url))) {
            window.location.href = "../login/sign-in.html";
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    //Ensure that the browser supports the service worker API then register it
    if (navigator.serviceWorker) {
        navigator.serviceWorker.register('../service-worker.js').then(reg => {
            console.log('Service Worker registered with scope:', reg.scope);
        }).catch(swErr => console.error(`Service Worker registration failed: ${swErr}}`));
    }

    if (sessionStorage.getItem("userData")) {
        updateSidebarWithUserData();
    }
});

function updateSidebarWithUserData() {
    // Load user info into sidebars
    let navUserName = document.getElementById("nav-username");
    let navUserEmail = document.getElementById("nav-useremail");
    let navUserPhoto = document.getElementById("nav-userphoto");
    let navSmUserPhoto = document.getElementById("nav-sm-userphoto");

    //Get user data from session storage/profile pic from local
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    const userProfilePic = localStorage.getItem("profilePic");

    if (navUserName) navUserName.textContent = userData?.name || null;
    if (navUserEmail) navUserEmail.textContent = userData?.email || null;
    if (navUserPhoto) navUserPhoto.src = userProfilePic || "../resources/images/avatar.png";
    if (navSmUserPhoto) navSmUserPhoto.src = userProfilePic || "../resources/images/avatar.png";
}

//Sign out functions ------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const navSignOut = document.getElementById("nav-signout");
    const navSmSignOut = document.getElementById("nav-sm-signout");

    navSignOut?.addEventListener("click", () => {
        signOutUser();
    });

    navSmSignOut?.addEventListener("click", () => {
        signOutUser();
    });

    function signOutUser() {
        signOut(auth).then(() => {
            // Sign-out successful.
            sessionStorage.removeItem('userData');
            sessionStorage.removeItem('userRole');
            localStorage.removeItem('profilePic');
        }).catch((error) => {
            showToast(error.code, error.message, STATUS_COLOR.RED, true, 10);
        });
    }
});

import { getStorage } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js';
const storage = getStorage(app);
export { auth, db, storage };