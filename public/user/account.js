import { showToast, STATUS_COLOR } from "../utils/toasts.js";
import { callApi } from "../utils/apiCall.js";
import { storage } from "../utils/auth.js";
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js';
import { regExpCalls, setupPhoneInput, imageStorageHandler } from "../utils/utils.js";
import { manageLoader } from "../utils/loader.js";

//#region LOAD DATA -------------------------------------------------
let userFName = document.getElementById("user-fname");
let userLName = document.getElementById("user-lname");
let userEmail = document.getElementById("user-email");
let userPhone = document.getElementById("user-phone");
let userProfilePic = document.getElementById("user-photo");
let userUploadPhoto = document.getElementById('user-upload-photo');
let userSubmit = document.getElementById('save-changes');
let selectedFile = null;
let userData = null;

let darkMode = document.getElementById("dark-mode");

setupPhoneInput(userPhone);

if (sessionStorage.getItem("userData")) {
    userData = JSON.parse(sessionStorage.getItem("userData"));
    const [fName, lName] = userData.name ? userData.name.split(" ") : ["", ""];
    const profilePic = localStorage.getItem("profilePic");

    userFName.value = fName;
    userLName.value = lName;
    userEmail.value = userData.email;
    userPhone.value = userData.phone;
    userProfilePic.src = profilePic || "../resources/images/avatar.png";
} else {
    manageLoader(true);

    document.addEventListener("authStateReady", () => {
        userData = JSON.parse(sessionStorage.getItem("userData"));
        const profilePic = localStorage.getItem("profilePic");

        if (userData) {
            const [fName, lName] = userData.name ? userData.name.split(" ") : ["", ""];

            userFName.value = fName;
            userLName.value = lName;
            userEmail.value = userData.email;
            userPhone.value = userData.phone;
            userProfilePic.src = profilePic || "../resources/images/avatar.png";
        }
    });

    manageLoader(false);
}

//Load the toggle states for settings
if (localStorage.getItem("theme") === "dark" || (!(localStorage.getItem("theme")) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    darkMode.checked = true;
} else {
    darkMode.checked = false;
}

darkMode.addEventListener('change', () => {
    if (darkMode.checked) {
        localStorage.setItem("theme", "dark");
        document.documentElement.classList.add("dark");
    } else {
        localStorage.setItem("theme", "light");
        document.documentElement.classList.remove("dark");
    }
});

userUploadPhoto.addEventListener("change", (event) => {
    selectedFile = event.target.files[0];
});

userSubmit.addEventListener("click", async () => {
    manageLoader(true);

    try {
        let navUserName = document.getElementById("nav-username");
        let navUserEmail = document.getElementById("nav-useremail");
        let navUserPhoto = document.getElementById("nav-userphoto");
        let navSmUserPhoto = document.getElementById("nav-sm-userphoto");

        const [originalFirst, originalLast] = userData.name ? userData.name.split(" ") : ["", ""];
        const originalEmail = userData.email;
        const originalPhone = userData.phone;

        const fName = userFName.value.trim();
        const lName = userLName.value.trim();
        const email = userEmail.value.trim();
        const phone = userPhone.value.trim();

        //Initial check to make sure input is valid
        if (!regExpCalls.testName(fName) || !regExpCalls.testName(lName)) {
            showToast("Missing Name", "Please make sure you have correctly entered your first or last name.", STATUS_COLOR.RED, true, 5);
            return;
        }

        if (!regExpCalls.testEmail(email)) {
            showToast("Invalid Email", "Please make sure you have correctly entered your email.", STATUS_COLOR.RED, true, 5);
            return;
        }

        if (!regExpCalls.testPhone(phone)) {
            showToast("Invalid Phone", "Please make sure you have correctly entered your phone number.", STATUS_COLOR.RED, true, 5);
            return;
        }

        //Check to see what needs to be updated
        let updateValues = {};
        let compressedImg = null;

        //First and last name check
        if (originalFirst !== fName && originalLast !== lName) {
            updateValues.name = fName + " " + lName;
        } else if (originalFirst !== fName && originalLast === lName) {
            updateValues.name = fName + " " + originalLast;
        } else if (originalFirst === fName && originalLast !== lName) {
            updateValues.name = originalFirst + " " + lName;
        }

        //Email check
        if (originalEmail !== email) {
            updateValues.email = email;
        } else if (updateValues.name) {
            updateValues.email = originalEmail;
        }

        //Phone check
        if (originalPhone !== phone) {
            updateValues.phone = phone;
        } else if (updateValues.name || updateValues.email) {
            updateValues.phone = originalPhone;
        }

        //Cleanup check
        if (!updateValues.name && (updateValues.email || updateValues.phone)) {
            updateValues.name = originalFirst + " " + originalLast;
        }
        if (!updateValues.email && (updateValues.name || updateValues.phone)) {
            updateValues.email = originalEmail;
        }

        //Profile pic check
        if (selectedFile) {
            compressedImg = await imageStorageHandler.compress(selectedFile);
        }

        let updatedUserInfo = false, updatedProfilePic = false;
        //Update the user info and/or their profile picture
        if (updateValues.name && updateValues.email && updateValues.phone) {
            await callApi(`/user/${userData.id}`, 'PUT', updateValues);

            //Update user data stuff
            navUserName.textContent = updateValues.name;
            navUserEmail.textContent = updateValues.email;
            userData.name = updateValues.name;
            userData.email = updateValues.email;
            userData.phone = updateValues.phone;
            sessionStorage.setItem("userData", JSON.stringify(userData));
            updatedUserInfo = true;
        }

        if (compressedImg !== null) {
            const storageRef = ref(storage, `users/${userData.id}/profilePic/avatar`);
            await uploadBytes(storageRef, compressedImg);
            const downloadURL = await getDownloadURL(storageRef);
            await callApi(`/profilePicMeta/${userData.id}`, 'POST', { url: downloadURL });
            localStorage.setItem('profilePic', downloadURL);

            //Save the image to the localStorage and update all image things
            userUploadPhoto.value = null;
            imageStorageHandler.saveFile('profilePic', compressedImg);
            const url = URL.createObjectURL(compressedImg);
            navUserPhoto.src = url;
            navSmUserPhoto.src = url;
            userProfilePic.src = url;
            updatedProfilePic = true;
        }

        if (updatedUserInfo || updatedProfilePic) {
            showToast("Account Updated", "Your account has been updated with any new information you provided.", STATUS_COLOR.GREEN, true, 5);
        }
    } catch (error) {
        console.log('Error updating info:', error);
        showToast("Error Updating Information", "There was an error with updating your information. Please try again", STATUS_COLOR.RED, true, 5);
    }

    manageLoader(false);
});
//#endregion LOAD DATA ----------------------------------------------