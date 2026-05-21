import { showToast, STATUS_COLOR } from "../utils/toasts.js";
import { callApi } from "../utils/apiCall.js";
import { handleSkeletons } from "../utils/skeletons.js";
import { handleTableRow, handleTableCreation, setupDropdown, setupCurrencyInput, addOptionToDropdown } from "../utils/utils.js";
import { createModals } from "../utils/confirmModal.js";
import { manageLoader } from "../utils/loader.js";
import { auth } from "../utils/auth.js";

//#region CREATE TABLES/LOAD DATA -----------------------------------
let userData, userRole, troopInventoryData, parentInventoryData, trooperInventoryData = [];

//First show skeleton loaders as inventory info is waiting to be pulled
const mainContent = document.getElementsByClassName('main-content')[0];
handleSkeletons.tableSkeleton(mainContent, 3);

//Wait for auth setup then pull user role and inventory
document.addEventListener("authStateReady", async () => {
    userData = JSON.parse(sessionStorage.getItem("userData"));
    userRole = JSON.parse(sessionStorage.getItem('userRole'));

    //Create necessary tables based on user role
    if (userRole && userData.id) {
        //First get the inventory data and troopers of the parent
        troopInventoryData = await callApi('/leaderInventory');
        parentInventoryData = await callApi(`/inventory/${userData.id}`);
        const parentTrooperData = await callApi(`/troopersOwnerId/${userData.id}`);

        if (userRole.role === "parent") {
            handleTableCreation.troopInventory(mainContent, null);
            handleTableCreation.yourInventory(mainContent);
            loadInventoryTableRows(troopInventoryData.inventory, "troop", false);
            loadInventoryTableRows(parentInventoryData[0]?.inventory || [], "your");
        } else if (userRole.role === "leader") {
            handleTableCreation.troopInventory(mainContent, openCookieModalAdmin);
            handleTableCreation.needInventory(mainContent);
            handleTableCreation.yourInventory(mainContent);

            loadInventoryTableRows(troopInventoryData.inventory, "troop");
            const groupedNeedToOrder = Object.values(
                (troopInventoryData.needToOrder || []).reduce((acc, cookie) => {
                    if (acc[cookie.varietyId]) {
                        acc[cookie.varietyId].boxes += cookie.boxes;
                    } else {
                        acc[cookie.varietyId] = { ...cookie };
                    }
                    return acc;
                }, {})
            );
            loadInventoryTableRows(groupedNeedToOrder, "need");
            loadInventoryTableRows(parentInventoryData[0]?.inventory || [], "your");
        }

        if (parentTrooperData) {
            await loadTrooperInventoryTableRows(parentTrooperData);
        }

        setupAndLoadDropdowns();
    } else {
        showToast("Error Loading Data", "There was an error loading user data. Please refresh the page to try again.", STATUS_COLOR.RED, false);
        return;
    }

    //Remove the skeletons and setup add cookie modal
    handleSkeletons.removeSkeletons(mainContent);
}, { once: true });

if (sessionStorage.getItem("userData") && sessionStorage.getItem("userRole")) {
    auth.currentUser?.getIdToken().then(() => {
        document.dispatchEvent(new CustomEvent("authStateReady"));
    });
}

function loadInventoryTableRows(inventory, inventoryType, hasActions = true) {
    if (!inventory) return;

    //Load the parent's owe amount
    if (inventoryType === "your") {
        const oweElem = document.getElementById("your-inventory-owe");
        oweElem.textContent = `Owe: ${(parentInventoryData[0]?.owe || 0).toLocaleString("en-US", { style: "currency", currency: "USD" })}`;
    }

    inventory.forEach((cookie) => {
        const cookieData = {
            variety: cookie.variety,
            boxes: cookie.boxes,
            boxPrice: cookie.boxPrice ? cookie.boxPrice.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "",
        }

        if (inventoryType === "troop") {
            if (hasActions) {
                handleTableRow.troopInventory(cookie.varietyId, cookieData, editCookie, createModals.deleteItem(deleteCookie));
            } else {
                handleTableRow.troopInventory(cookie.varietyId, cookieData, null, null);
            }
        } else if (inventoryType === "need") {
            handleTableRow.needInventory(cookie.varietyId, cookieData, openNeedCookieModal, null);
        } else if (inventoryType === "your") {
            handleTableRow.yourInventory(cookie.varietyId, cookieData);
        }
    });
}

async function loadTrooperInventoryTableRows(troopers) {
    if (!troopers) return;

    await Promise.all(troopers.map(async (trooper) => {
        const inventory = await callApi(`/inventory/${trooper.id}`);
        if (inventory) {
            trooperInventoryData.push(inventory);
            trooperInventoryData = trooperInventoryData.flat();
            handleTableCreation.trooperInventory(mainContent, trooper, openCookieModalUser);

            //Load the trooper's owe amount
            const oweIdTrooperName = trooper.trooperName.replaceAll(' ', '-').toLowerCase();
            const oweElem = document.getElementById(`inventory-for-${oweIdTrooperName}-owe`);
            oweElem.textContent = `Owe: ${inventory[0].owe.toLocaleString("en-US", { style: "currency", currency: "USD" })}`;

            if (!inventory[0].inventory) return;
            inventory[0].inventory.forEach((cookie) => {
                const cookieData = {
                    variety: cookie.variety,
                    boxes: cookie.boxes,
                    boxPrice: cookie.boxPrice.toLocaleString("en-US", { style: "currency", currency: "USD" }),
                }
                const trooperName = trooper.trooperName.replace(' ', '-').toLowerCase();
                handleTableRow.trooperInventory(cookie.varietyId, cookieData, trooperName, null, null);
            });
        }
    }));
}
//#endregion CREATE TABLES/LOAD DATA --------------------------------

//#region Add/Edit Inventory ----------------------------------------
let cookieForm = document.getElementById('cookie-form');
let cookieTitle = document.getElementById('cookie-title');
let cookieSubtitle = document.getElementById('cookie-subtitle');
let cookieCancel = document.getElementById('cookie-cancel');
let cookieSubmit = document.getElementById('cookie-submit');
let cookieClose = document.getElementById('cookie-close');

//Input variables
const cookieNameAdmin = document.getElementById("cookie-name-admin");
const cookieName = document.getElementById("cookie-name");
const cookieNameUser = document.getElementById("cookie-name-user");
const cookieNameBtn = document.getElementById("cookie-name-btn");
const cookiePriceAdmin = document.getElementById("cookie-price-admin");
const cookiePrice = document.getElementById("cookie-price");
const cookieStock = document.getElementById("cookie-stock");

function setupAndLoadDropdowns() {
    if (parentInventoryData && parentInventoryData[0].inventory?.length > 0) {
        parentInventoryData[0].inventory.forEach((cookie) => {
            addOptionToDropdown('cookie-name-dropdown', cookie.variety, cookie.varietyId);
        });
    } else {
        addOptionToDropdown('cookie-name-dropdown', "No cookies in your inventory", null);
    }

    setupDropdown('cookie-name-btn', 'cookie-name-dropdown');

    //Setup currency input
    setupCurrencyInput(cookiePrice);
}

//Show the add cookie modal depending on user role
function openCookieModalAdmin(mode = "add", cookieData) {
    cookieNameAdmin.classList.remove('hidden');
    cookieNameUser.classList.add('hidden');
    cookiePriceAdmin.classList.remove('hidden');

    if (mode === "edit") {
        cookieTitle.textContent = "Edit Cookie";
        cookieSubtitle.textContent = "Edit the selected cookie to make changes";
        cookieName.value = cookieData.variety;
        cookiePrice.value = cookieData.boxPrice;
        cookieStock.value = cookieData.boxes;
    }

    cookieForm.setAttribute('data-admin', "true");
    cookieForm.setAttribute('data-mode', mode);
    cookieForm.classList.remove('hidden');
    cookieForm.classList.add('flex');
}

function openCookieModalUser(mode = "add", cookieData, trooperId = null) {
    //If the parent hasn't made an order, don't allow assigning cookies
    if (parentInventoryData && parentInventoryData[0].inventory?.length === 0) {
        showToast("No Cookies to Assign", "You do not have cookies in your inventory to assign to this trooper.", STATUS_COLOR.RED, true, 8);
        return;
    }

    cookieNameAdmin.classList.add('hidden');
    cookieNameUser.classList.remove('hidden');
    cookiePriceAdmin.classList.add('hidden');

    if (mode === "edit") {
        cookieTitle.textContent = "Edit Cookie";
        cookieSubtitle.textContent = "Edit the selected cookie to make changes";
        cookieStock.value = cookieData.boxes;
        cookieNameBtn.textContent = cookieData.variety;
        cookieNameBtn.value = cookieData.varietyId;
        cookieNameBtn.disabled = true;
    }

    if (trooperId) cookieForm.setAttribute('data-tid', trooperId);
    cookieForm.setAttribute('data-admin', "false");
    cookieForm.setAttribute('data-mode', mode);
    cookieForm.classList.remove('hidden');
    cookieForm.classList.add('flex');
}

//Close/Cancel the cookie modal
cookieClose.addEventListener('click', closeCookieModal, false);
cookieCancel.addEventListener('click', closeCookieModal, false);

function closeCookieModal() {
    cookieTitle.textContent = "Add Cookie";
    cookieSubtitle.textContent = "Add a new cookie to the inventory";
    cookieForm.setAttribute('data-mode', "add");
    cookieForm.removeAttribute('data-tid');
    cookieForm.classList.remove('flex');
    cookieForm.classList.add('hidden');
    cookieName.value = "";
    cookiePrice.value = "";
    cookieStock.value = "";
    cookieNameBtn.textContent = "Select Cookie";
    cookieNameBtn.value = "";
    cookieNameBtn.disabled = false;
}

//Verify input and submit new cookie
cookieSubmit.addEventListener('click', (e) => {
    e.preventDefault();
    const isAdmin = cookieForm.getAttribute('data-admin');
    const cName = isAdmin === "true" ? cookieName.value.trim() : cookieNameBtn.textContent.trim();
    const cPrice = parseFloat(cookiePrice.value.replace(/[^0-9.-]+/g, "")) || 0;
    const cStock = parseInt(cookieStock.value, 10) || 0;

    if (isAdmin === "true") {
        if (cName === "") {
            showToast("Invalid Cookie Name", "Please make sure that you have correctly entered the cookie's name.", STATUS_COLOR.RED, true, 5);
            return;
        }

        if (cPrice === 0) {
            showToast("Invalid Cookie Price", "Please make sure that you have entered the correct price for this cookie.", STATUS_COLOR.RED, true, 5);
            return;
        }
    } else {
        if (cName === "Select Cookie" || cName === "No cookies in your inventory") {
            showToast("Invalid Cookie Name", "Please make sure that you have selected a cookie.", STATUS_COLOR.RED, true, 5);
            return;
        }
    }

    if (cStock === 0) {
        showToast("Invalid Cookie Stock", "Please make sure that you have entered the correct box amount for this cookie.", STATUS_COLOR.RED, true, 5);
        return;
    }

    const currentMode = cookieForm.getAttribute('data-mode');

    const cookieData = {
        variety: cName,
        boxes: cStock,
    }

    //If it is an admin, add the cookie to the troop inventory
    //If it is a user, assign the cookie to the trooper inventory
    if (isAdmin === "true") {
        cookieData.boxPrice = cPrice;
        if (currentMode === "add") {
            createCookieApi(cookieData);
        } else if (currentMode === "edit") {
            const cookieId = handleTableRow.currentRowEditing.getAttribute('data-cid');
            updateCookieApi(cookieData, cookieId);
        }
    } else {
        const trooperId = cookieForm.getAttribute('data-tid');
        cookieData.varietyId = cookieNameBtn.value;
        cookieData.boxPrice = parentInventoryData[0].inventory.find(item => item.varietyId === cookieData.varietyId).boxPrice;
        if (currentMode === "add") {
            addCookieToTrooperInventoryApi(trooperId, cookieData);
        } else if (currentMode === "edit") {
            const cookieId = handleTableRow.currentRowEditing.getAttribute('data-cid');
            updateTrooperInventoryApi(trooperId, cookieData, cookieId);
        }
    }
});

async function createCookieApi(cookieData) {
    manageLoader(true);

    try {
        //Create cookie and then add it to troop inventory
        const cookieId = await callApi('/cookie', 'POST', { variety: cookieData.variety, boxPrice: cookieData.boxPrice });
        const newCookieData = cookieData;
        newCookieData.varietyId = cookieId.id;
        troopInventoryData.inventory.push(newCookieData);
        await callApi('/leaderInventory', 'PUT', troopInventoryData);
        //Cookie created, add to table and show message
        const displayCookieData = { ...newCookieData };
        displayCookieData.boxPrice = displayCookieData.boxPrice.toLocaleString("en-US", { style: "currency", currency: "USD" });
        handleTableRow.troopInventory(cookieId.id, displayCookieData, editCookie, createModals.deleteItem(deleteCookie));
        showToast("Cookie Added", "A new cookie has been created and added to the troop inventory.", STATUS_COLOR.GREEN, true, 5);
    } catch (error) {
        console.error('Error creating cookie:', error);
        showToast("Error Creating Cookie", 'There was an error with creating this cookie. Please try again.', STATUS_COLOR.RED, true, 5);
    }

    manageLoader(false);
    cookieClose.click();
}

async function updateCookieApi(cookieData, cookieId) {
    manageLoader(true);

    try {
        //Update cookie and troop inventory
        await callApi(`/cookie/${cookieId}`, 'PUT', { variety: cookieData.variety, boxPrice: cookieData.boxPrice });
        troopInventoryData.inventory = troopInventoryData.inventory.map(item => item.varietyId === cookieId ? {
            ...item,
            variety: cookieData.variety,
            boxes: cookieData.boxes,
            boxPrice: cookieData.boxPrice,
        } : item);
        await callApi('/leaderInventory', 'PUT', troopInventoryData);
        //Cookie updated, update data in table and show message
        cookieData.boxPrice = cookieData.boxPrice.toLocaleString("en-US", { style: "currency", currency: "USD" });
        handleTableRow.updateInventoryRow(handleTableRow.currentRowEditing, cookieData);
        showToast("Cookie Updated", "The selected cookie has been updated with the new information.", STATUS_COLOR.GREEN, true, 5);
    } catch (error) {
        console.error('Error updating cookie:', error);
        showToast("Error Updating Cookie", 'There was an error with updating this cookie. Please try again.', STATUS_COLOR.RED, true, 5);
    }

    manageLoader(false);
    cookieClose.click();
}

async function addCookieToTrooperInventoryApi(trooperId, cookieData) {
    manageLoader(true);

    try {
        // First check parent's available inventory
        const parentCookie = parentInventoryData[0].inventory.find(item => item.varietyId === cookieData.varietyId);

        if (!parentCookie) {
            showToast("Error Assigning Cookie", "Cookie not found in parent inventory.", STATUS_COLOR.RED, true, 5);
            manageLoader(false);
            return;
        }

        // Calculate total boxes already assigned to troopers
        const assignedBoxes = trooperInventoryData.reduce((total, trooper) => {
            const trooperCookie = trooper.inventory.find(cookie =>
                cookie.varietyId === cookieData.varietyId
            );
            return total + (trooperCookie?.boxes || 0);
        }, 0);

        // Calculate available boxes
        const availableBoxes = parentCookie.boxes - assignedBoxes;

        if (availableBoxes < cookieData.boxes) {
            showToast("Insufficient Inventory", `You only have ${availableBoxes} boxes of ${parentCookie.variety} available to assign. Please check your inventory.`, STATUS_COLOR.RED, true, 8);
            manageLoader(false);
            return;
        }

        // If we have enough inventory, proceed with assignment
        const trooperInventory = trooperInventoryData.find(item => item.trooperId === trooperId);

        if (trooperInventory) {
            trooperInventory.inventory.push(cookieData);
            await callApi(`/trooperInventory/${trooperInventory.id}`, 'PUT', trooperInventory);

            cookieData.boxPrice = cookieData.boxPrice.toLocaleString("en-US", { style: "currency", currency: "USD" });
            const trooperName = trooperInventory.trooperName.replace(' ', '-').toLowerCase();
            handleTableRow.trooperInventory(cookieData.varietyId, cookieData, trooperName, editCookie, createModals.deleteItem(deleteCookie));

            showToast("Cookie Assigned", "The selected cookie has been assigned to the trooper's inventory.", STATUS_COLOR.GREEN, true, 5);
        } else {
            showToast("Error Assigning Cookie", "There was an error assigning the cookie to the trooper's inventory. Please try again.", STATUS_COLOR.RED, true, 5);
        }
    } catch (error) {
        console.error('Error assigning cookie to trooper inventory:', error);
        showToast("Error Assigning Cookie", 'There was an error with assigning this cookie to the trooper inventory. Please try again.', STATUS_COLOR.RED, true, 5);
    }

    manageLoader(false);
    cookieClose.click();
}

async function updateTrooperInventoryApi(trooperId, cookieData, cookieId) {
    manageLoader(true);

    try {
        //Update cookie in trooper inventory
        const trooperInventory = trooperInventoryData.find(item => item.trooperId === trooperId);
        if (trooperInventory) {
            trooperInventory.inventory = trooperInventory.inventory.map(item => item.varietyId === cookieId ? {
                ...item,
                boxes: cookieData.boxes,
            } : item);
            await callApi(`/trooperInventory/${trooperInventory.id}`, 'PUT', trooperInventory);
            //Cookie updated, update data in table and show message
            cookieData.boxPrice = cookieData.boxPrice.toLocaleString("en-US", { style: "currency", currency: "USD" });
            handleTableRow.updateInventoryRow(handleTableRow.currentRowEditing, cookieData);
            showToast("Cookie Updated", "The selected cookie has been updated with the new information.", STATUS_COLOR.GREEN, true, 5);
        } else {
            showToast("Error Updating Cookie", 'There was an error with updating this cookie. Please try again.', STATUS_COLOR.RED, true, 5);
        }
    } catch (error) {
        console.error('Error updating cookie:', error);
        showToast("Error Updating Cookie", 'There was an error with updating this cookie. Please try again.', STATUS_COLOR.RED, true, 5);
    }

    manageLoader(false);
    cookieClose.click();
}
//#endregion --------------------------------------------------------

//#region TABLE ACTIONS ---------------------------------------------
function editCookie() {
    const isAdmin = handleTableRow.currentRowEditing.parentElement.id === "troop-inventory-tbody";
    if (isAdmin) {
        openCookieModalAdmin("edit", getRowData(handleTableRow.currentRowEditing));
    } else {
        const trooperId = handleTableRow.currentRowEditing.parentElement.getAttribute('data-tid');
        openCookieModalUser("edit", getRowData(handleTableRow.currentRowEditing), trooperId);
    }
}

//Need cookie form --------------------------------------
let needCookieForm = document.getElementById('need-cookie-form');
let needCookieCancel = document.getElementById('need-cookie-cancel');
let needCookieSubmit = document.getElementById('need-cookie-submit');
let needCookieClose = document.getElementById('need-cookie-close');
const needCookieBoxes = document.getElementById("need-cookie-boxes");

function openNeedCookieModal() {
    needCookieBoxes.value = handleTableRow.currentRowEditing.children[1].textContent;
    needCookieForm.classList.remove('hidden');
    needCookieForm.classList.add('flex');
}

//Close/Cancel the need cookie modal
needCookieClose.addEventListener('click', closeNeedCookieModal, false);
needCookieCancel.addEventListener('click', closeNeedCookieModal, false);

function closeNeedCookieModal() {
    needCookieForm.classList.remove('flex');
    needCookieForm.classList.add('hidden');
    needCookieBoxes.value = "";
}

//Verify input and update need to order boxes
needCookieSubmit.addEventListener('click', (e) => {
    e.preventDefault();
    const cookieId = handleTableRow.currentRowEditing.getAttribute('data-cid');
    const cName = handleTableRow.currentRowEditing.children[0].textContent;
    const cStock = parseInt(needCookieBoxes.value, 10);

    if (isNaN(cStock) || cStock < 0) {
        showToast("Invalid Cookie Stock", "Please make sure that you have entered the correct box amount for this cookie.", STATUS_COLOR.RED, true, 5);
        return;
    }

    const cookieData = {
        varietyId: cookieId,
        variety: cName,
        boxes: cStock,
    }

    const orderId = handleTableRow.currentRowEditing.getAttribute('data-cid');
    updateNeedCookiesApi(orderId, cookieData);
});

async function updateNeedCookiesApi(varietyId, cookieData) {
    manageLoader(true);

    try {
        await callApi(`/updateNeedToOrder/${varietyId}`, 'PUT', { updatedCookies: cookieData });

        if (cookieData.boxes === 0) {
            handleTableRow.currentRowEditing.remove();
        } else {
            handleTableRow.currentRowEditing.children[1].textContent = cookieData.boxes;
        }

        // Refresh troop inventory table
        troopInventoryData = await callApi('/leaderInventory');
        if (troopInventoryData) {
            const troopTbody = document.getElementById('troop-inventory-tbody');
            troopTbody.replaceChildren();
            loadInventoryTableRows(troopInventoryData.inventory, "troop");

            const needTbody = document.getElementById('need-to-order-tbody');
            needTbody.replaceChildren();
            const groupedNeedToOrder = Object.values(
                (troopInventoryData.needToOrder || []).reduce((acc, cookie) => {
                    if (acc[cookie.varietyId]) {
                        acc[cookie.varietyId].boxes += cookie.boxes;
                    } else {
                        acc[cookie.varietyId] = { ...cookie };
                    }
                    return acc;
                }, {})
            );
            loadInventoryTableRows(groupedNeedToOrder, "need");
        }

        showToast("Need To Order Updated", "The selected cookie has been updated with the new information.", STATUS_COLOR.GREEN, true, 5);
    } catch (error) {
        console.error('Error updating need to order:', error);
        showToast("Error Updating Need To Order", 'There was an error with updating the boxes needed for this cookie. Please try again.', STATUS_COLOR.RED, true, 5);
    }

    manageLoader(false);
    needCookieClose.click();
}
//-------------------------------------------------------

async function deleteCookie() {
    manageLoader(true);

    try {
        //Delete the cookie from the troop inventory and from the cookies
        const cookieId = handleTableRow.currentRowEditing.getAttribute('data-cid');
        await callApi(`/cookie/${cookieId}`, 'DELETE');
        troopInventoryData.inventory = troopInventoryData.inventory.filter(item => item.varietyId !== cookieId);
        await callApi('/leaderInventory', 'PUT', troopInventoryData);
        //Cookie deleted, remove from tables and show message
        handleTableRow.currentRowEditing.remove();
        showToast("Cookie Deleted", "The selected cookie has been removed from the inventory.", STATUS_COLOR.GREEN, true, 5);
    } catch (error) {
        console.error('Error deleting trooper:', error);
        showToast("Error Deleting Trooper", 'There was an error with deleting this trooper. Please try again.', STATUS_COLOR.RED, true, 5);
    }

    manageLoader(false);
}

function getRowData(row) {
    //Exclude the last <td> (actions)
    let tds = Array.from(row.children).slice(0, -1);
    let index = 0;

    let cookieData = {
        varietyId: row.getAttribute('data-cid'),
        variety: tds[index++]?.textContent.trim(),
        boxes: tds[index++]?.textContent.trim(),
        boxPrice: tds[index++]?.textContent.trim(),
    }

    return cookieData;
}
//#endregion TABLE ACTIONS ------------------------------------------