import { auth, db } from "../utils/auth.js";
import { createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js';
import { manageLoader } from "../utils/loader.js";
import { regExpCalls, setupPhoneInput } from "../utils/utils.js";
import { showToast, STATUS_COLOR } from "../utils/toasts.js";
import { callApi } from "../utils/apiCall.js";

const createFName = document.getElementById("create-fname");
const createLName = document.getElementById("create-lname");
const createEmail = document.getElementById("create-email");
const createPhone = document.getElementById("create-phone");
const createPassword = document.getElementById("create-password");
const confirmPassword = document.getElementById("confirm-password");
const acceptTerms = document.getElementById("accept-terms");
const createAccount = document.getElementById("create-account");

setupPhoneInput(createPhone);

createAccount?.addEventListener('click', (e) => {
    e.preventDefault();
    createUserAccount();
});

function createUserAccount() {
    const confPass = (createPassword.value.trim() === confirmPassword.value.trim());
    const termsResult = acceptTerms.checked;

    //Check if results are good
    if (!regExpCalls.testName(createFName.value.trim())) {
        showToast("Missing Information", "Please make sure you have correctly entered your first name.", STATUS_COLOR.RED, true, 5);
        return;
    }

    if (!regExpCalls.testName(createLName.value.trim())) {
        showToast("Missing Information", "Please make sure you have correctly entered your last name.", STATUS_COLOR.RED, true, 5);
        return;
    }

    if (!regExpCalls.testEmail(createEmail.value.trim())) {
        console.log(createEmail.value.trim());
        showToast("Invalid Email", "Please make sure you have entered a valid email.", STATUS_COLOR.RED, true, 5);
        return;
    }

    if (!regExpCalls.testPhone(createPhone.value)) {
        showToast("Invalid Phone", "Please make sure you have entered a valid phone number.", STATUS_COLOR.RED, true, 5);
        return;
    }

    if (!regExpCalls.testPassword(createPassword.value.trim())) {
        showToast("Invalid Password", "Password must be at least 6 characters and contain 1 special character, 1 uppercase, and 1 number.", STATUS_COLOR.RED, true, 8);
        return;
    }

    if (!confPass) {
        showToast("Passwords Do Not Match", "Please make sure password and confirm password match.", STATUS_COLOR.RED, true, 5);
        return;
    }

    if (!termsResult) {
        showToast("Accept Terms", "You must read and accept our terms of service before continuing.", STATUS_COLOR.RED, true, 5);
        return;
    }

    // Show loader then try to create account
    manageLoader(true);
    localStorage.setItem("creatingAccount", true);
    createUserWithEmailAndPassword(auth, createEmail.value.trim(), createPassword.value.trim())
        .then((userCredential) => {         
            // Upload user information to database
            setDoc(doc(db, "users", userCredential.user.uid), {
                name: createFName.value.trim() + " " + createLName.value.trim(),
                email: createEmail.value.trim(),
                phone: createPhone.value.trim(),
                role: "parent",
                password: createPassword.value.trim(),
            }).then(async () => {
                // Successful upload, set role through custom claims and create parent inventory
                const customClaim = await callApi(`/attachRoleAsCustomClaim/${userCredential.user.uid}`, 'POST', null, false);
                const inventoryId = await callApi(`/parentInventory`, 'POST', {ownerId: userCredential.user.uid});
                localStorage.removeItem("creatingAccount");
                if (customClaim && inventoryId) window.location.href = "../login/sign-in.html";
            }).catch((error) => {
                manageLoader(false);
                console.log(error.code + ": " + error.message);
                showToast("Account Creation Error", "There was an error while trying to create your account. Please try again.", STATUS_COLOR.RED, true, 10);
            });
        })
        .catch((error) => {
            manageLoader(false);
            localStorage.removeItem("creatingAccount");
            console.log(error.code + ": " + error.message);
            showToast("Account Creation Error", "There was an error while trying to create your account. Please try again.", STATUS_COLOR.RED, true, 10);
        });
}