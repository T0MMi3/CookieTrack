import { showToast, STATUS_COLOR } from "../utils/toasts.js";
import { callApi } from "../utils/apiCall.js";
import { storage } from "../utils/auth.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js';
import { regExpCalls, handleTableCreation, handleTableRow, imageStorageHandler } from "../utils/utils.js";
import { createModals } from "../utils/confirmModal.js";
import { handleSkeletons } from "../utils/skeletons.js";
import { manageLoader } from "../utils/loader.js";
import { auth } from "../utils/auth.js";

//#region CREATE TABLES/LOAD DATA -----------------------------------
let userData, userRole, userTroopers, troopRewardData;

//First show skeleton loaders as reward info is waiting to be pulled
const mainContent = document.getElementsByClassName('main-content')[0];
handleSkeletons.rewardSkeleton(mainContent, 2);

//Wait for auth setup then pull user role and rewards
document.addEventListener("authStateReady", async () => {
    userData = JSON.parse(sessionStorage.getItem("userData"));
    userRole = JSON.parse(sessionStorage.getItem('userRole'));

    //Create necessary tables based on user role
    if (userRole && userData.id) {
        //Get the troopers associated with the user
        userTroopers = await callApi(`/troopersOwnerId/${userData.id}`);

        //Load the troop reward data
        troopRewardData = await callApi('/reward');

        //Create the table for adding new rewards 
        if (userRole.role === "leader") {
            handleTableCreation.troopRewards(mainContent, openAddRewardModal);
            if (troopRewardData) loadRewardTableRows(troopRewardData);
        }

        //Create all the reward boxes for all the users's troopers
        await loadRewardBoxes(userTroopers, troopRewardData);
    } else {
        showToast("Error Loading Data", "There was an error loading user data. Please refresh the page to try again.", STATUS_COLOR.RED, false);
        return;
    }

    //Remove the skeletons
    handleSkeletons.removeSkeletons(mainContent);
}, { once: true });

if (sessionStorage.getItem("userData") && sessionStorage.getItem("userRole")) {
    auth.currentUser?.getIdToken().then(() => {
        document.dispatchEvent(new CustomEvent("authStateReady"));
    });
}

function loadRewardTableRows(rewards) {
    rewards.forEach((reward) => {
        const rewardId = reward.id;
        handleTableRow.troopReward(rewardId, reward, editReward, createModals.deleteItem(deleteReward));
    });
}

async function loadRewardBoxes(troopers, rewardData) {
    if (!troopers && userRole.role === "parent") {
        showToast("No Troopers", "There are no troopers in your account to show rewards for.", STATUS_COLOR.RED, false);
        return;
    } else if (!troopers) return;

    await Promise.all(troopers.map(async (trooper) => {
        const saleData = await callApi(`/saleData/${trooper.saleDataId}`);

        //Set all the current rewards from trooper to redeemed
        trooper.currentReward.forEach((reward) => {
            reward.redeemed = "Redeemed";
        });

        //Merge the trooper current rewards and rewardData arrays
        let rewards = rewardData;
        if (trooper.currentReward.length > 0 && rewardData.length > 0) {
            // Create a map to merge rewards while prioritizing trooper.currentReward
            const uniqueRewards = new Map();

            // First, add current rewards (ensures redeemed status is kept)
            trooper.currentReward.forEach((reward) => {
                uniqueRewards.set(reward.id, reward);
            });

            // Then, add rewards from rewardData (only if they don't already exist)
            rewardData.forEach((reward) => {
                if (!uniqueRewards.has(reward.id)) {
                    uniqueRewards.set(reward.id, reward);
                }
            });

            rewards = Array.from(uniqueRewards.values());
        }

        //Sort rewards in ascending order based on boxesNeeded
        rewards.sort((a, b) => a.boxesNeeded - b.boxesNeeded);

        // Calculate the number of available rewards (unredeemed and eligible based on boxesSold)
        trooper.available = rewards.filter(reward =>
            reward.redeemed !== "Redeemed" && saleData.totalBoxesSold >= reward.boxesNeeded
        ).length;
        trooper.boxesSold = saleData.totalBoxesSold;

        handleTableCreation.rewardBox(mainContent, trooper, rewards, openChoiceModal);
    }));
}
//#endregion CREATE TABLES/LOAD DATA --------------------------------

//#region Add/Edit/Select Rewards ------------------------------------------
let rewardForm = document.getElementById('reward-form');
let rewardTitle = document.getElementById('reward-title');
let rewardSubtitle = document.getElementById('reward-subtitle');
let rewardCancel = document.getElementById('reward-cancel');
let rewardSubmit = document.getElementById('reward-submit');
let rewardClose = document.getElementById('reward-close');

//Add/edit reward form variables
const rewardName = document.getElementById('reward-name');
const rewardDesc = document.getElementById('reward-description');
const rewardBoxes = document.getElementById('reward-boxes');
const rewardImage = document.getElementById('reward-image');
const rewardChoices = document.getElementById('reward-choices');
const addChoiceBtn = document.getElementById('add-choice');
let selectedFile = null;

//Select reward choice form variables
const choiceModal = document.getElementById('choice-modal');
const choiceOptions = document.getElementById('choice-options');
const choiceClose = document.getElementById('choice-close');
const choiceCancel = document.getElementById('choice-cancel');
const choiceSubmit = document.getElementById('choice-submit');
let selectedChoice = null;

function openAddRewardModal(mode = "add", rewardData) {
    if (mode === "edit") {
        rewardTitle.textContent = "Edit Reward";
        rewardSubtitle.textContent = "Edit the selected reward to make changes";
        rewardName.value = rewardData.name;
        rewardDesc.value = rewardData.description;
        rewardBoxes.value = rewardData.boxesNeeded;

        // Clear existing choices
        rewardChoices.innerHTML = '';

        // Add existing choices
        if (rewardData.choices && rewardData.choices.length > 0) {
            rewardData.choices.forEach(choice => {
                const choiceDiv = document.createElement('div');
                choiceDiv.className = 'reward-choice flex items-center gap-2';
                choiceDiv.innerHTML = `
                    <input type="text" 
                        class="bg-white dark:bg-black border border-gray flex-1 text-base text-black dark:text-white px-4 py-2.5 rounded-default accent-green"
                        placeholder="Enter reward choice" 
                        value="${choice}" />
                    <button type="button" class="remove-choice text-red hover:text-red-light" title="Remove choice">
                        <i class="fa-solid fa-times"></i>
                    </button>
                `;
                rewardChoices.appendChild(choiceDiv);
            });
        }
    } else {
        // Clear choices for new reward
        rewardChoices.innerHTML = `
            <div class="reward-choice flex items-center gap-2">
                <input type="text" 
                    class="bg-white dark:bg-black border border-gray flex-1 text-base text-black dark:text-white px-4 py-2.5 rounded-default accent-green"
                    placeholder="Enter reward choice" />
                <button type="button" class="remove-choice text-red hover:text-red-light" title="Remove choice">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
        `;
    }

    rewardForm.setAttribute('data-mode', mode);
    rewardForm.classList.remove('hidden');
    rewardForm.classList.add('flex');
}

//Close/Cancel the reward modal
rewardClose.addEventListener('click', closeRewardModal, false);
rewardCancel.addEventListener('click', closeRewardModal, false);

function closeRewardModal() {
    rewardTitle.textContent = "Add Reward";
    rewardSubtitle.textContent = "Add a new reward for the troop";
    rewardForm.setAttribute('data-mode', "add");
    rewardForm.classList.remove('flex');
    rewardForm.classList.add('hidden');
    rewardName.value = "";
    rewardDesc.value = "";
    rewardBoxes.value = "";
    rewardImage.value = "";
    selectedFile = null;

    // Reset choices to initial state
    rewardChoices.innerHTML = `
        <div class="reward-choice flex items-center gap-2">
            <input type="text" 
                class="bg-white dark:bg-black border border-gray flex-1 text-base text-black dark:text-white px-4 py-2.5 rounded-default accent-green"
                placeholder="Enter reward choice" />
            <button type="button" class="remove-choice text-red hover:text-red-light" title="Remove choice">
                <i class="fa-solid fa-times"></i>
            </button>
        </div>
    `;
}

rewardImage.addEventListener("change", (e) => {
    selectedFile = e.target.files[0];
});

//Verify input and submit new reward
rewardSubmit.addEventListener('click', (e) => {
    e.preventDefault();
    const name = rewardName.value.trim();
    const desc = rewardDesc.value.trim() || "";
    const boxes = parseInt(rewardBoxes.value, 10) || 0;
    const currentMode = rewardForm.getAttribute('data-mode');

    // Get all choices
    const choices = Array.from(rewardChoices.querySelectorAll('input')).map(input => input.value.trim()).filter(choice => choice !== "");

    if (!name) {
        showToast("Missing Reward Name", "Please make sure you have correctly entered the reward's name.", STATUS_COLOR.RED, true, 5);
        return;
    }

    if (boxes === 0) {
        showToast("Missing Boxes Needed", "Please make sure you have entered the number of boxes needed to redeem the reward.", STATUS_COLOR.RED, true, 5);
        return;
    }

    if (!selectedFile && currentMode === "add") {
        showToast("Missing Image", "Please make sure you have uploaded an image for the reward.", STATUS_COLOR.RED, true, 5);
        return;
    }

    if (choices.length < 1) {
        showToast("Missing Choices", "Please add at least one choice for the reward.", STATUS_COLOR.RED, true, 5);
        return;
    }

    const rewardData = {
        name: name,
        description: desc,
        boxesNeeded: boxes,
        downloadUrl: selectedFile,
        choices: choices,
    }

    if (currentMode === "add") {
        createRewardApi(rewardData);
    } else if (currentMode === "edit") {
        const rewardId = handleTableRow.currentRowEditing.getAttribute("data-rid");
        updateRewardApi(rewardData, rewardId);
    }
});

async function createRewardApi(rewardData) {
    manageLoader(true);

    try {
        //First compress the reward image and remove it from rewardData
        const compressedImg = await imageStorageHandler.compress(rewardData.downloadUrl, 224, 224);
        delete rewardData.downloadUrl;

        //Next upload the reward
        const rewardId = await callApi('/reward', 'POST', rewardData);

        //Then upload the reward img
        const storageRef = ref(storage, `rewards/${rewardId.id}/reward-image`);
        await uploadBytes(storageRef, compressedImg);
        const downloadUrl = await getDownloadURL(storageRef);
        await callApi(`/rewardImgMeta/${rewardId.id}`, 'POST', { downloadUrl });
        rewardData.downloadUrl = downloadUrl.downloadURL;
        rewardData.id = rewardId.id;

        // Add the new reward to local troopRewardData array
        troopRewardData.push(rewardData);

        //Reward created, add to table and show message
        handleTableRow.troopReward(rewardId.id, rewardData, editReward, createModals.deleteItem(deleteReward));
        showToast("Reward Added", "A new reward has been created for the troop.", STATUS_COLOR.GREEN, true, 5);
    } catch (error) {
        console.error('Error creating reward:', error);
        showToast("Error Creating Reward", 'There was an error with creating this reward. Please try again.', STATUS_COLOR.RED, true, 5);
    }

    manageLoader(false);
    rewardClose.click();
}

async function updateRewardApi(rewardData, rewardId) {
    manageLoader(true);

    try {
        let newDownloadUrl = null;
        //First upload the new reward image if there is one
        if (rewardData.downloadUrl !== null) {
            const compressedImg = await imageStorageHandler.compress(rewardData.downloadUrl, 224, 224);
            const storageRef = ref(storage, `rewards/${rewardId}/reward-image`);
            await uploadBytes(storageRef, compressedImg);
            newDownloadUrl = await getDownloadURL(storageRef);
            await callApi(`/rewardImgMeta/${rewardId}`, 'POST', { downloadUrl: newDownloadUrl });
            rewardData.downloadUrl = newDownloadUrl.downloadURL;
        } else {
            //If there is not a new reward image, get the original img link
            const tr = handleTableRow.currentRowEditing;
            const imgSrc = tr.querySelector('img').src;
            rewardData.downloadUrl = imgSrc;
        }

        await callApi(`/reward/${rewardId}`, 'PUT', rewardData);

        //Update the local troopRewardData array
        const rewardIndex = troopRewardData.findIndex(r => r.id === rewardId);
        if (rewardIndex !== -1) {
            troopRewardData[rewardIndex] = { ...troopRewardData[rewardIndex], ...rewardData };
        }

        //Reward updated, update data in table and show message
        handleTableRow.updateRewardRow(handleTableRow.currentRowEditing, rewardData);
        showToast("Reward Updated", "The selected reward has been updated with the new information.", STATUS_COLOR.GREEN, true, 5);
    } catch (error) {
        console.error('Error updating reward:', error);
        showToast("Error Updating Reward", 'There was an error with updating this reward. Please try again.', STATUS_COLOR.RED, true, 5);
    }

    manageLoader(false);
    rewardClose.click();
}

//Select/Redeem reward functionality
addChoiceBtn.addEventListener('click', () => {
    const choiceDiv = document.createElement('div');
    choiceDiv.className = 'reward-choice flex items-center gap-2';
    choiceDiv.innerHTML = `
        <input type="text" 
            class="bg-white dark:bg-black border border-gray flex-1 text-base text-black dark:text-white px-4 py-2.5 rounded-default accent-green"
            placeholder="Enter reward choice" />
        <button type="button" class="remove-choice text-red hover:text-red-light" title="Remove choice">
            <i class="fa-solid fa-times"></i>
        </button>
    `;
    rewardChoices.appendChild(choiceDiv);
});

rewardChoices.addEventListener('click', (e) => {
    if (e.target.closest('.remove-choice')) {
        e.target.closest('.reward-choice').remove();
    }
});

function openChoiceModal(rewardId) {
    // Find the reward in local rewardData
    const reward = troopRewardData.find(r => r.id === rewardId);

    if (!reward) {
        showToast("Error", "Reward not found", STATUS_COLOR.RED, true, 5);
        return;
    }

    //Reset selected choice
    selectedChoice = null;
    choiceSubmit.disabled = true;

    if (reward.choices && reward.choices.length > 0) {
        //Populate choice options
        choiceOptions.innerHTML = reward.choices.map((choice, index) => `
            <button class="choice-btn w-full p-3 text-left text-black dark:text-white rounded-default border border-gray hover:bg-green-light" 
                data-choice="${index}">
                ${choice}
            </button>
        `).join('');

        //Handle choice button clicks
        choiceOptions.addEventListener('click', (e) => {
            const btn = e.target.closest('.choice-btn');
            if (btn) {
                //Remove active class from all buttons
                choiceOptions.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('bg-green'));
                //Add active class to selected button
                btn.classList.add('bg-green');
                selectedChoice = reward.choices[btn.dataset.choice];
                choiceSubmit.disabled = false;
            }
        });
    }

    choiceModal.classList.remove('hidden');
    choiceModal.classList.add('flex');
}

//Close/cancel the choice modal
choiceClose.addEventListener('click', closeChoiceModal, false);
choiceCancel.addEventListener('click', closeChoiceModal, false);

function closeChoiceModal() {
    selectedChoice = null;
    choiceOptions.innerHTML = '';
    choiceSubmit.disabled = true;
    choiceModal.classList.remove('flex');
    choiceModal.classList.add('hidden');
}

//Verify choice and redeem the reward
choiceSubmit.addEventListener('click', (e) => {
    e.preventDefault();
    const trooperId = handleTableRow.currentRowEditing.getAttribute('data-tid');
    const rewardId = handleTableRow.currentRowEditing.getAttribute('data-rid');

    if (!selectedChoice) {
        showToast("Missing Choice", "Please select a choice for the reward.", STATUS_COLOR.RED, true, 5);
        return;
    }

    redeemRewardWithChoice(trooperId, rewardId, selectedChoice);
});

async function redeemRewardWithChoice(trooperId, rewardId, selectedChoice) {
    manageLoader(true);

    try {
        await callApi(`/selectReward/${trooperId}`, 'POST', {
            rewardId: rewardId,
            userId: userData.id,
            selectedChoice: selectedChoice
        });

        // Update UI
        const redeemBtn = document.getElementById(trooperId + "-" + rewardId);
        redeemBtn.disabled = true;
        redeemBtn.textContent = "Redeemed: " + selectedChoice;
        redeemBtn.classList.remove("bg-green", "text-white", "hover:bg-green-light");
        redeemBtn.classList.add("bg-green-super-light", "text-black");

        const availableRewards = document.getElementById(trooperId + "-available");
        const availableNum = parseInt(availableRewards.textContent);
        availableRewards.textContent = availableNum - 1;

        showToast("Reward Redeemed", "The chosen reward has been redeemed.", STATUS_COLOR.GREEN, true, 5);
    } catch (error) {
        console.error('Error redeeming reward:', error);
        showToast("Error Redeeming Reward", 'There was an error with redeeming this reward. Please try again.', STATUS_COLOR.RED, true, 5);
    }

    manageLoader(false);
    closeChoiceModal();
}
//#endregion --------------------------------------------------------

//#region TABLE ACTIONS ---------------------------------------------
function editReward() {
    openAddRewardModal("edit", getRowData(handleTableRow.currentRowEditing));
}

async function deleteReward() {
    manageLoader(true);

    try {
        //First delete reward from storage then from firestore
        const rewardId = handleTableRow.currentRowEditing.getAttribute('data-rid');
        try { await callApi(`/rewardImg/${rewardId}`, 'DELETE'); } catch (e) { console.log('No reward image to delete'); }
        await callApi(`/reward/${rewardId}`, 'DELETE');

        // Remove from local rewardData array
        troopRewardData = troopRewardData.filter(r => r.id !== rewardId);

        //Reward deleted, remove from tables and show message
        handleTableRow.currentRowEditing.remove();
        showToast("Reward Deleted", "The selected reward has been deleted.", STATUS_COLOR.GREEN, true, 5);
    } catch (error) {
        console.error('Error deleting reward:', error);
        showToast("Error Deleting Reward", 'There was an error with deleting this reward. Please try again.', STATUS_COLOR.RED, true, 5);
    }

    manageLoader(false);
}

function getRowData(row) {
    // Get the reward from troopRewardData using the row's ID
    const rewardId = row.getAttribute('data-rid');
    const reward = troopRewardData.find(r => r.id === rewardId);

    let rewardData = {
        name: reward.name,
        description: reward.description,
        boxesNeeded: reward.boxesNeeded,
        choices: reward.choices || [],
        downloadUrl: reward.downloadUrl
    };

    return rewardData;
}

//#endregion TABLE ACTIONS ------------------------------------------