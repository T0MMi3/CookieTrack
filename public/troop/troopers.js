import { showToast, STATUS_COLOR } from "../utils/toasts.js";
import { callApi } from "../utils/apiCall.js";
import { regExpCalls, setupDropdown, handleTableRow, searchTableRows, handleTableCreation } from "../utils/utils.js";
import { createModals } from "../utils/confirmModal.js";
import { handleSkeletons } from "../utils/skeletons.js";
import { manageLoader } from "../utils/loader.js";
import { auth } from "../utils/auth.js";

//#region CREATE TABLES/LOAD DATA -----------------------------------
let userData, userRole, troopInventoryData;

//First show skeleton loaders as trooper info is waiting to be pulled
const mainContent = document.getElementsByClassName('main-content')[0];
handleSkeletons.tableSkeleton(mainContent, 2);

//Wait for auth setup then pull user role and troopers
document.addEventListener("authStateReady", async () => {
    userData = JSON.parse(sessionStorage.getItem("userData"));
    userRole = JSON.parse(sessionStorage.getItem('userRole'));

    //Create necessary tables based on user role
    if (userRole && userData.id) {
        //First get the troop inventory data and store it
        troopInventoryData = await callApi('/leaderInventory');
        if (troopInventoryData) {
            sessionStorage.setItem('troopInventoryData', JSON.stringify(troopInventoryData));
        }

        if (userRole.role === "parent") {
            //Create table
            handleTableCreation.yourTrooper(mainContent, openTrooperModal);

            const yourTrooperData = await callApi(`/troopersOwnerId/${userData.id}`);
            await loadTrooperTableRows(yourTrooperData, false);
        } else if (userRole.role === "leader") {
            //Create tables and setup search for all troopers
            handleTableCreation.allTrooper(mainContent);
            handleTableCreation.yourTrooper(mainContent, openTrooperModal);
            searchTableRows.allTroopers("all-troopers-search");

            const allTrooperData = await callApi(`/troopers/`);
            const yourTrooperData = await callApi(`/troopersOwnerId/${userData.id}`);
            await loadTrooperTableRows(allTrooperData, true);
            await loadTrooperTableRows(yourTrooperData, false);
        }
    } else {
        showToast("Error Loading Data", "There was an error loading user data. Please refresh the page to try again.", STATUS_COLOR.RED, false);
        return;
    }

    //Remove the skeletons and setup add trooper modal
    handleSkeletons.removeSkeletons(mainContent);

}, { once: true });

if (sessionStorage.getItem("userData") && sessionStorage.getItem("userRole")) {
    auth.currentUser?.getIdToken().then(() => {
        document.dispatchEvent(new CustomEvent("authStateReady"));
    });
}

async function loadTrooperTableRows(troopers, isAllTroopers) {
    if (!troopers) return;

    await Promise.all(troopers.map(async (trooper) => {
        //Get the trooper's order, sales, inventory, and reward data
        const orderData = await callApi(`/ordersTrooper/${trooper.id}`);
        const saleData = await callApi(`/saleData/${trooper.saleDataId}`);
        const inventoryData = await callApi(`/inventory/${trooper.id}`);

        const trooperData = {
            troopNumber: trooper.troopNumber,
            trooperName: trooper.trooperName,
            parentName: trooper.parentName,
            troopLeader: trooper.troopLeader,
            owe: inventoryData[0].owe.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
            boxesSold: saleData.totalBoxesSold,
            age: trooper.age,
            grade: trooper.grade,
            shirtSize: trooper.shirtSize,
        }

        const rewardData = trooper.currentReward;

        if (orderData && orderData.length > 0) {
            orderData.forEach((order) => {
                order.orderContent.totalCost = order.orderContent.totalCost.toLocaleString("en-US", { style: "currency", currency: "USD" });
                order.cashPaid = order.cashPaid.toLocaleString("en-US", { style: "currency", currency: "USD" });
                order.cardPaid = order.cardPaid.toLocaleString("en-US", { style: "currency", currency: "USD" });
                order.orderContent.owe = order.orderContent.owe.toLocaleString("en-US", { style: "currency", currency: "USD" });
            });
        }

        const data = {
            trooperData: trooperData,
            orderData: orderData || [],
            rewardData: rewardData,
        }

        if (isAllTroopers) {
            handleTableRow.allTrooper(trooper.id, data, editTrooperData, createModals.deleteItem(deleteTrooper));
        } else {
            handleTableRow.yourTrooper(trooper.id, data, editTrooperData, createModals.deleteItem(deleteTrooper));
        }
    }));
}
//#endregion CREATE TABLES/LOAD DATA --------------------------------

//#region Add Trooper -----------------------------------------------
let trooperForm = document.getElementById('trooper-form');
let trooperTitle = document.getElementById('trooper-title');
let trooperSubtitle = document.getElementById('trooper-subtitle');
let trooperCancel = document.getElementById('trooper-cancel');
let trooperSubmit = document.getElementById('trooper-submit');
let trooperClose = document.getElementById('trooper-close');

//Input variables
const trooperNumber = document.getElementById("trooper-number");
const trooperName = document.getElementById("trooper-name");
const trooperAge = document.getElementById("trooper-age");
const trooperGrade = document.getElementById("trooper-grade-btn");
const trooperSize = document.getElementById("trooper-size-btn");
const trooperLeader = document.getElementById("trooper-leader");

//Dropdown functionality
setupDropdown('trooper-grade-btn', 'trooper-grade-dropdown');
setupDropdown('trooper-size-btn', 'trooper-size-dropdown');

function openTrooperModal(mode = "add", trooperData) {
    if (mode === "edit") {
        trooperTitle.textContent = 'Edit Trooper';
        trooperSubtitle.textContent = "Edit the selected trooper to make changes";
        trooperNumber.value = trooperData.troopNumber;
        trooperName.value = trooperData.trooperName;
        trooperLeader.value = trooperData.troopLeader;
        trooperAge.value = trooperData.age;
        trooperGrade.textContent = trooperData.grade;
        trooperSize.textContent = trooperData.shirtSize;
    }

    trooperForm.setAttribute("data-mode", mode);
    trooperForm.classList.remove('hidden');
    trooperForm.classList.add('flex');
}

//Close/Cancel the trooper modal
trooperClose.addEventListener('click', closeAddTrooperModal, false);
trooperCancel.addEventListener('click', closeAddTrooperModal, false);

function closeAddTrooperModal() {
    trooperTitle.textContent = "Add Trooper";
    trooperSubtitle.textContent = "Add a new trooper to your account";
    trooperForm.setAttribute('data-mode', "add");
    trooperForm.classList.remove('flex');
    trooperForm.classList.add('hidden');
    trooperNumber.value = "";
    trooperName.value = "";
    trooperLeader.value = "";
    trooperAge.value = "";
    trooperGrade.textContent = "Select Grade Level";
    trooperSize.textContent = "Select Shirt/Jacket Size";
}

//Verify input and add a new trooper
trooperSubmit.addEventListener('click', (e) => {
    e.preventDefault();
    const pUid = userData.id;
    const pName = userData.name;
    const number = trooperNumber.value.trim();
    const name = trooperName.value.trim();
    const age = parseInt(trooperAge.value, 10) || 0;
    const grade = trooperGrade.textContent;
    const size = trooperSize.textContent;
    const leader = trooperLeader.value.trim();

    if (number === null || number === "") {
        showToast("Invalid Trooper Number", "Please make sure you have correctly entered the trooper number.", STATUS_COLOR.RED, true, 5);
        return;
    }

    if (!regExpCalls.testFullName(name) || !regExpCalls.testFullName(leader)) {
        showToast("Invalid Name", "Please make sure you have correctly entered the trooper and leader name.", STATUS_COLOR.RED, true, 5);
        return;
    }

    if (age === 0) {
        showToast("Invalid Age", "Please make sure you have correctly entered an age greater than 0.", STATUS_COLOR.RED, true, 5);
        return;
    }

    if (grade.includes("Select") || size.includes("Select")) {
        showToast("Missing Information", "Please make sure you have selected a grade level and shirt size.", STATUS_COLOR.RED, true, 5);
        return;
    }

    const currentMode = trooperForm.getAttribute('data-mode');

    const trooperData = {
        troopNumber: number,
        trooperName: name,
        ownerId: pUid,
        parentName: pName,
        troopLeader: leader,
        age: age,
        grade: grade,
        shirtSize: size,
        owe: 0.0, //Only used to show in row for trooper creation
        boxesSold: 0, //Only used to show in row for trooper creation
    }

    if (currentMode === "add") {
        createTrooperApi(trooperData);
    } else if (currentMode === "edit") {
        const trooperId = handleTableRow.currentRowEditing.getAttribute("data-uid");
        updateTrooperApi(trooperData, trooperId);
    }
});

async function createTrooperApi(trooperData) {
    manageLoader(true);

    try {
        //Create trooper and their inventory
        const trooperId = await callApi('/trooper', 'POST', trooperData);
        const inventoryData = {
            ownerId: trooperId.id,
            parentId: userData.id,
            trooperId: trooperId.id,
            trooperName: trooperData.trooperName,
            troopNumber: trooperData.troopNumber
        }
        await callApi('/trooperInventory', 'POST', inventoryData);
        //Trooper created, add to tables and show message
        trooperData.owe = trooperData.owe.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        const data = {
            trooperData: trooperData,
            orderData: [],
            rewardData: [],
        }
        handleTableRow.yourTrooper(trooperId.id, data, editTrooperData, createModals.deleteItem(deleteTrooper));
        if (userRole === "leader") handleTableRow.allTrooper(trooperId.id, data, editTrooperData, createModals.deleteItem(deleteTrooper));
        showToast("Trooper Added", "A new trooper has been created for your account.", STATUS_COLOR.GREEN, true, 5);
    } catch (error) {
        console.error('Error creating trooper:', error);
        showToast("Error Creating Trooper", 'There was an error with creating this trooper. Please try again.', STATUS_COLOR.RED, true, 5);
    }

    manageLoader(false);
    trooperClose.click();
}

async function updateTrooperApi(trooperData, trooperId) {
    manageLoader(true);

    try {
        await callApi(`/trooper/${trooperId}`, 'PUT', trooperData);
        //Trooper updated, update data in tables and show message
        handleTableRow.updateTrooperRow(handleTableRow.currentRowEditing, trooperData);
        showToast("Trooper Updated", "The selected trooper has been updated with the new information.", STATUS_COLOR.GREEN, true, 5);
    } catch (error) {
        console.error('Error updating trooper:', error);
        showToast("Error Updating Trooper", 'There was an error with updating this trooper. Please try again.', STATUS_COLOR.RED, true, 5);
    }

    manageLoader(false);
    trooperClose.click();
}
//#endregion --------------------------------------------------------

//#region TABLE ACTIONS ---------------------------------------------
function editTrooperData() {
    openTrooperModal("edit", getRowData(handleTableRow.currentRowEditing));
}

async function deleteTrooper() {
    manageLoader(true);

    try {
        const trooperId = handleTableRow.currentRowEditing.getAttribute('data-uid');
        await callApi(`/trooper/${trooperId}`, 'DELETE');
        //Trooper deleted, remove from tables and show message
        handleTableRow.currentRowEditing.remove();
        showToast("Trooper Deleted", "The selected trooper has been deleted.", STATUS_COLOR.GREEN, true, 5);
    } catch (error) {
        console.error('Error deleting trooper:', error);
        showToast("Error Deleting Trooper", 'There was an error with deleting this trooper. Please try again.', STATUS_COLOR.RED, true, 5);
    }

    manageLoader(false);
}

function getRowData(row) {
    //Exclude the first and last <td> (dropdown and actions)
    let tds = Array.from(row.children).slice(1, -1);
    let index = 0;

    let trooperData = {
        troopNumber: tds[index++]?.textContent.trim(),
        trooperName: tds[index++]?.textContent.trim(),
        parentName: tds[index++]?.textContent.trim(),
        troopLeader: tds[index++]?.textContent.trim(),
        owe: tds[index++]?.textContent.trim(),
        boxesSold: tds[index++]?.textContent.trim(),
        age: tds[index++]?.textContent.trim(),
        grade: tds[index++]?.textContent.trim(),
        shirtSize: tds[index++]?.textContent.trim(),
    }

    return trooperData;
}

//Table dropdown for individual troopers
document.querySelectorAll('tr .show-row').forEach((btn) => {
    btn.addEventListener('click', () => {
        let arrow = btn.querySelector('i');
        let hiddenRow = btn.parentElement.nextElementSibling;

        if (arrow.classList.contains('fa-caret-down')) {
            hiddenRow.classList.remove('hidden');
            arrow.className = 'fa-solid fa-caret-up text-xl';
        } else {
            hiddenRow.classList.add('hidden');
            arrow.className = 'fa-solid fa-caret-down text-xl';
        }
    });
});
//#endregion TABLE ACTIONS ------------------------------------------