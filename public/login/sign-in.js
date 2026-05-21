import { auth, db } from "../utils/auth.js";
import { setPersistence, browserLocalPersistence, browserSessionPersistence, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, getAdditionalUserInfo } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js';
import { manageLoader } from "../utils/loader.js";
import { showToast, STATUS_COLOR } from "../utils/toasts.js";
import { callApi } from "../utils/apiCall.js";

const provider = new GoogleAuthProvider();
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const rememberMe = document.getElementById("remember-me");
const loginBtn = document.getElementById("login");
const googleLoginBtn = document.getElementById("login-google");

loginBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    loginUserEmail();
});

function loginUserEmail() {
    manageLoader(true);
    const email = loginEmail.value;
    const password = loginPassword.value;
    const saveLogin = rememberMe.checked;

    setPersistence(auth, saveLogin ? browserLocalPersistence : browserSessionPersistence)
        .then(() => {
            // If remember me is checked, persistence will be until user signs out
            // If not checked, persistence will be for the current session (tab)
            return signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Signed in 
                    const user = userCredential.user;
                })
                .catch((error) => {
                    manageLoader(false);
                    console.log(error.code + ": " + error.message);
                    showToast("Login Failed", "Make sure you have entered your account email and password correctly.", STATUS_COLOR.RED, true, 8);
                });
        })
        .catch((error) => {
            manageLoader(false);
            console.log(error.code + ": " + error.message);
            showToast("Persistance Error", "An unexpected error occured. Please login again.", STATUS_COLOR.RED, true, 8);
        });

}

googleLoginBtn?.addEventListener('click', () => {
    manageLoader(true);
    localStorage.setItem("creatingAccount", true);
    signInWithPopup(auth, provider).then((result) => {
        // Access additional identity provider data
        const additionalUserInfo = getAdditionalUserInfo(result);
        const isNewUser = additionalUserInfo?.isNewUser;

        //Save profile to database if new user, otherwise go to dashboard
        if (isNewUser) {
            const user = result.user;
            setDoc(doc(db, "users", user.uid), {
                name: user.displayName,
                email: user.email,
                phone: "",
                role: "parent"
            }).then(async () => {
                // Successful upload, set role through custom claims and create parent inventory
                const customClaim = await callApi(`/attachRoleAsCustomClaim/${user.uid}`, 'POST', null, false);
                const inventoryId = await callApi(`/parentInventory`, 'POST', { ownerId: user.uid });
                localStorage.removeItem("creatingAccount");
                if (customClaim && inventoryId) window.location.href = "../dashboard/dashboard.html";
            }).catch((error) => {
                manageLoader(false);
                console.log(error.code + ": " + error.message);
                showToast("Unable to Sign In", "There was an error during account creation. Please try again.", STATUS_COLOR.RED, true, 6);
            });
        } else {
            //Signed in
            localStorage.removeItem("creatingAccount");
            window.location.href = "../dashboard/dashboard.html";
        }
    }).catch((error) => {
        manageLoader(false);
        localStorage.removeItem("creatingAccount");
        console.log(error.code + ": " + error.message);
        showToast("Unable to Sign In", "There was an error trying to sign in with your Google account. Please try again.", STATUS_COLOR.RED, true, 10);
    });;
});