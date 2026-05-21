import { showToast, STATUS_COLOR } from "../utils/toasts.js";
import { callApi } from "../utils/apiCall.js";
import { regExpCalls, setupCurrencyInput, setupDropdown, addOptionToDropdown, handleTableRow, searchTableRows, handleTableCreation } from "../utils/utils.js";
import { createModals } from "../utils/confirmModal.js";
import { handleSkeletons } from "../utils/skeletons.js";
import { openFileUploadModal, formatFileSize, downloadFile, deleteUploadedFile } from "./uploadFiles.js";
import { manageLoader } from "../utils/loader.js";
import { auth } from "../utils/auth.js";

//#region CREATE TABLES/LOAD DATA -----------------------------------
let userData, userRole, userTroopers, troopInventoryData, userOrderData, allOrderData;

//First show skeleton loaders as order info is waiting to be pulled
const mainContent = document.getElementsByClassName('main-content')[0];
handleSkeletons.tableSkeleton(mainContent, 3);

//Wait for auth setup then pull user role and orders
document.addEventListener("authStateReady", async () => {
    userData = JSON.parse(sessionStorage.getItem("userData"));
    userRole = JSON.parse(sessionStorage.getItem('userRole'));

    //Create necessary tables based on user role
    if (userRole && userData) {
        //First get the troop inventory data and store it
        troopInventoryData = await callApi('/leaderInventory');
        if (troopInventoryData) {
            sessionStorage.setItem('troopInventoryData', JSON.stringify(troopInventoryData));
            createCookieInputs();
        }

        //Now create tables after inventory data is available
        handleTableCreation.yourDocuments(mainContent, openFileUploadModal);
        handleTableCreation.currentOrder(mainContent, openOrderModal);
        handleTableCreation.completedOrder(mainContent);
        searchTableRows.currentOrders("current-orders-search", "current-orders-datestart", "current-orders-dateend", "current-orders-clear-filters");
        searchTableRows.completedOrders("completed-orders-search", "completed-orders-datestart", "completed-orders-dateend", "completed-orders-clear-filters");

        //Load the documents that the user has if any
        loadFileTableRows(userData.documents);

        //Get the troopers associated with the user
        userTroopers = await callApi(`/troopersOwnerId/${userData.id}`);
        if (userRole.role === "parent") {
            userOrderData = await callApi(`/ordersOwner/${userData.id}`);
            loadOrderTableRows(userOrderData);
        } else if (userRole.role === "leader") {
            allOrderData = await callApi('/order');
            loadOrderTableRows(allOrderData);
        }

        setupDropdownsAndInputs();
    } else {
        showToast("Error Loading Data", "There was an error loading user data. Please refresh the page to try again.", STATUS_COLOR.RED, false);
        return;
    }

    //Remove the skeletons and setup add order modal
    handleSkeletons.removeSkeletons(mainContent);
}, { once: true });

// If authStateReady already fired before this listener was registered, run immediately
if (sessionStorage.getItem("userData") && sessionStorage.getItem("userRole")) {
    auth.currentUser?.getIdToken().then(() => {
        document.dispatchEvent(new CustomEvent("authStateReady"));
    });
}

function loadOrderTableRows(orders) {
    if (!orders) return;
    orders.forEach((order) => {
        order.orderContent.totalCost = (order.orderContent.totalCost || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
        order.cashPaid = order.cashPaid.toLocaleString("en-US", { style: "currency", currency: "USD" });
        order.cardPaid = order.cardPaid.toLocaleString("en-US", { style: "currency", currency: "USD" });
        order.orderContent.owe = (order.orderContent.owe || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

        //Check if order is a current order or if it is completed
        if (order.status && order.status === "Completed") {
            handleTableRow.completedOrder(order.id, order, userRole.role === "leader" ? createModals.deleteItem(deleteCompletedOrder) : null);
        } else if (order.status && order.status === "Picked up") {
            handleTableRow.currentOrder(order.id, order, null, createModals.deleteItem(deleteCurrentOrder), editOrderPaidAmounts);
        } else {
            handleTableRow.currentOrder(order.id, order, editCurrentOrder, createModals.deleteItem(deleteCurrentOrder), createModals.pickupOrder(markOrderAsPickedUp));
        }
    });
}

function loadFileTableRows(files) {
    if (!files) return;
    files.forEach((file) => {
        const fileData = {
            fileName: file.name,
            fileSize: formatFileSize(file.size),
            dateUploaded: new Date(file.dateUploaded).toLocaleDateString("en-US"),
        }

        handleTableRow.yourDocuments(file.url, fileData, downloadFile, createModals.deleteItem(deleteUploadedFile));
    });
}
//#endregion CREATE TABLES/LOAD DATA --------------------------------

//#region Add/Edit Orders -------------------------------------------
let orderForm = document.getElementById('order-form');
let orderTitle = document.getElementById('order-title');
let orderSubtitle = document.getElementById('order-subtitle');
let orderCancel = document.getElementById('order-cancel');
let orderSubmit = document.getElementById('order-submit');
let orderClose = document.getElementById('order-close');

//Input variables
const orderTrooper = document.getElementById("order-trooper-btn");
const orderBEmail = document.getElementById("order-bemail");
const orderPickup = document.getElementById("order-pickup-btn");
const orderContact = document.getElementById("order-contact-btn");
const orderCash = document.getElementById("order-cash");
const orderCard = document.getElementById("order-card");
const orderAgreement = document.getElementById("order-agreement");

let cookieInputRefs = {};

function createCookieInputs() {
    if (!troopInventoryData?.inventory) return;

    // Find the pickup location div to insert before
    const pickupLocationDiv = orderPickup.closest('div').parentElement;

    // Create and insert all cookie inputs in order
    troopInventoryData.inventory.forEach(cookie => {
        const fieldId = `order-${cookie.variety.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())}`;

        const div = document.createElement('div');
        div.innerHTML = `
            <label class="text-black dark:text-white text-base mb-2 block"># ${cookie.variety}</label>
            <div class="relative flex items-center">
                <input id="${fieldId}" type="number" min="0"
                    class="bg-white dark:bg-black border border-gray w-full text-base text-black dark:text-white px-4 py-2.5 rounded-default accent-green"
                    placeholder="# of ${cookie.variety}" />
                <i class="fa-solid fa-hashtag absolute right-4 dark:text-white"></i>
            </div>
        `;

        // Insert before pickup location
        pickupLocationDiv.parentNode.insertBefore(div, pickupLocationDiv);

        // Store reference to input
        cookieInputRefs[cookie.variety] = document.getElementById(fieldId);
    });
}

//Setup dropdowns and inputs
function setupDropdownsAndInputs() {
    setupDropdown('order-pickup-btn', 'order-pickup-dropdown');
    setupDropdown('order-contact-btn', 'order-contact-dropdown');

    //Load troopers into dropdown
    if (userTroopers) {
        userTroopers.forEach((trooper) => {
            addOptionToDropdown('order-trooper-dropdown', trooper.trooperName, trooper.id);
        });
    } else {
        addOptionToDropdown('order-trooper-dropdown', "No Troopers in Account", null);
    }

    setupDropdown('order-trooper-btn', 'order-trooper-dropdown');

    //Setup currency inptus
    setupCurrencyInput(orderCash);
    setupCurrencyInput(orderCard);
}

function openOrderModal(mode = "add", orderData) {
    if (mode === "edit") {
        orderTitle.textContent = "Edit Order";
        orderSubtitle.textContent = "Edit the selected order to make changes";
        orderTrooper.value = userTroopers.find(trooper => trooper.trooperName === orderData.trooperName)?.id || null;
        orderTrooper.textContent = orderData.trooperName;
        orderBEmail.value = orderData.buyerEmail;

        // Set values for cookie inputs
        Object.keys(cookieInputRefs).forEach(variety => {
            if (cookieInputRefs[variety]) {
                cookieInputRefs[variety].value = orderData.orderContent[variety.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())] || '';
            }
        });

        orderPickup.textContent = orderData.pickupLocation;
        orderContact.textContent = regExpCalls.testPhone(orderData.contact) ? "Phone" : "Email";
        orderCash.value = orderData.cashPaid;
        orderCard.value = orderData.cardPaid;
        orderAgreement.checked = orderData.financialAgreement === "Agreed" ? true : false;
    } else if (mode === "edit-amounts") {
        //Used for only being able to edit the cash/card amounts
        orderTitle.textContent = "Edit Order Paid Amounts";
        orderSubtitle.textContent = "Edit the selected order to update paid amounts";
        orderTrooper.value = userTroopers.find(trooper => trooper.trooperName === orderData.trooperName)?.id || null;
        orderTrooper.textContent = orderData.trooperName;
        orderTrooper.parentElement.parentElement.classList.add('hidden');
        orderBEmail.value = orderData.buyerEmail;
        orderBEmail.parentElement.parentElement.classList.add('hidden');
        orderPickup.parentElement.parentElement.classList.add('hidden');
        orderContact.parentElement.parentElement.classList.add('hidden');
        orderAgreement.parentElement.parentElement.classList.add('hidden');
        Object.keys(cookieInputRefs).forEach(variety => {
            if (cookieInputRefs[variety]) {
                cookieInputRefs[variety].value = orderData.orderContent[variety.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())] || '';
                cookieInputRefs[variety].parentElement.parentElement.classList.add('hidden');
            }
        });

        orderPickup.textContent = orderData.pickupLocation;
        orderContact.textContent = regExpCalls.testPhone(orderData.contact) ? "Phone" : "Email";
        orderCash.value = orderData.cashPaid;
        orderCard.value = orderData.cardPaid;
        orderAgreement.checked = orderData.financialAgreement === "Agreed" ? true : false;
    }

    orderForm.setAttribute('data-mode', mode);
    orderForm.classList.remove('hidden');
    orderForm.classList.add('flex');
}

//Close/Cancel the order modal
orderClose.addEventListener('click', closeOrderModal, false);
orderCancel.addEventListener('click', closeOrderModal, false);

function closeOrderModal() {
    orderTitle.textContent = "Add Order";
    orderSubtitle.textContent = "Add a new order to your account";
    orderForm.setAttribute('data-mode', "add");
    orderForm.classList.remove('flex');
    orderForm.classList.add('hidden');
    orderTrooper.value = "";
    orderTrooper.textContent = "Select Trooper";
    orderBEmail.value = "";
    Object.keys(cookieInputRefs).forEach(variety => {
        if (cookieInputRefs[variety]) {
            cookieInputRefs[variety].value = "";
            cookieInputRefs[variety].parentElement.parentElement.classList.remove('hidden');
        }
    });
    orderPickup.textContent = "Select Location";
    orderContact.textContent = "Select Preference";
    orderCash.value = "";
    orderCard.value = "";
    orderAgreement.checked = false;

    //Used for only being able to edit the cash/card amounts
    orderTrooper.parentElement.parentElement.classList.remove('hidden');
    orderBEmail.parentElement.parentElement.classList.remove('hidden');
    orderPickup.parentElement.parentElement.classList.remove('hidden');
    orderContact.parentElement.parentElement.classList.remove('hidden');
    orderAgreement.parentElement.parentElement.classList.remove('hidden');
}

//Verify input and submit new order
orderSubmit.addEventListener('click', (e) => {
    e.preventDefault();
    const tId = orderTrooper.value;
    const tName = orderTrooper.textContent.trim();
    const bEmail = orderBEmail.value.trim();
    const pUid = userData.id;
    const pName = userData.name;
    const pEmail = userData.email;
    const pPhone = userData.phone;

    const pickup = orderPickup.textContent.trim();
    const contact = orderContact.textContent.trim();
    const cash = parseFloat(orderCash.value.replace(/[^0-9.-]+/g, "")) || 0;
    const card = parseFloat(orderCard.value.replace(/[^0-9.-]+/g, "")) || 0;
    const financialAgreement = orderAgreement.checked;

    if (tName.includes("Select")) {
        showToast("Missing Trooper", "Please make sure you have selected a trooper.", STATUS_COLOR.RED, true, 5);
        return;
    }

    if (!regExpCalls.testEmail(bEmail)) {
        showToast("Invalid Buyer Email", "Please make sure you have correctly entered the buyer's email.", STATUS_COLOR.RED, true, 5);
        return;
    }

    const orderBoxes = {};
    let totalBoxes = 0;

    // Get values from all cookie inputs
    Object.keys(cookieInputRefs).forEach(variety => {
        const value = parseInt(cookieInputRefs[variety].value, 10) || 0;
        const fieldName = variety.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
        orderBoxes[fieldName] = value;
        totalBoxes += value;
    });

    if (totalBoxes === 0) {
        showToast("Missing Information", "Please make sure you have entered at least one box sale in the order.", STATUS_COLOR.RED, true, 5);
        return;
    }

    if (pickup.includes("Select") || contact.includes("Select")) {
        showToast("Missing Information", "Please make sure you have selected a pickup location and contact preference.", STATUS_COLOR.RED, true, 5);
        return;
    }

    if (!financialAgreement) {
        showToast("Accept Agreement", "You must accept the financial agreement before submitting this order.", STATUS_COLOR.RED, true, 5);
        return;
    }

    const currentMode = orderForm.getAttribute('data-mode');

    // Build array of cookie orders
    const cookies = [];
    let totalCost = 0;

    Object.keys(cookieInputRefs).forEach(variety => {
        const value = parseInt(cookieInputRefs[variety].value, 10) || 0;
        if (value > 0) {
            // Find the cookie in troop inventory to get its ID and price
            const inventoryCookie = troopInventoryData.inventory.find(c => c.variety === variety);
            if (inventoryCookie) {
                const cookieOrder = {
                    varietyId: inventoryCookie.varietyId,
                    variety: variety,
                    boxes: value,
                    boxPrice: inventoryCookie.boxPrice
                };
                cookies.push(cookieOrder);
                // Add to total cost
                totalCost += value * inventoryCookie.boxPrice;
            }
        }
    });

    // Perform a check to not allow overpaying for an order
    const totalPaid = cash + card;
    if (totalPaid > totalCost) {
        showToast("Invalid Payment Amount", "The total amount paid cannot exceed the order total cost.", STATUS_COLOR.RED, true, 5);
        return;
    }

    const orderContent = {
        cookies: cookies,
        totalCost: totalCost,
        boxTotal: cookies.reduce((sum, cookie) => sum + cookie.boxes, 0)
    }

    const orderData = {
        dateCreated: currentMode === "add" ? new Date().toLocaleDateString("en-US") : null,
        trooperId: tId,
        trooperName: tName,
        ownerId: pUid,
        ownerEmail: pEmail,
        ownerName: pName,
        buyerEmail: bEmail,
        contact: contact === "Phone" ? pPhone : pEmail,
        financialAgreement: financialAgreement === true ? "Agreed" : "Declined",
        pickupLocation: pickup,
        orderContent: orderContent,
        cashPaid: cash,
        cardPaid: card,
    }

    if (currentMode === "add") {
        orderData.saleDataId = userTroopers.find(trooper => trooper.id === tId).saleDataId;
        orderData.orderContent.owe = 0.0;
        createOrderApi(orderData);
    } else if (currentMode === "edit") {
        const orderId = handleTableRow.currentRowEditing.getAttribute("data-oid");

        //If the user is an admin, check if they are editing their own order or someone else's
        let needsUserInfo = false;
        if (userRole.role === "leader" && !allOrderData.find(order => order.id === orderId)) {
            //They are editing someone else's so get their user info and load it if need phone #
            orderData.ownerId = allOrderData.find(order => order.trooperId === tId).ownerId;
            orderData.ownerName = allOrderData.find(order => order.trooperId === tId).ownerName;
            orderData.ownerEmail = allOrderData.find(order => order.trooperId === tId).ownerEmail;
            if (contact === "Phone") {
                needsUserInfo = true;
            } else {
                orderData.contact = orderData.ownerEmail;
            }
        }

        updateOrderApi(orderData, orderId, needsUserInfo);
    } else if (currentMode === "edit-amounts") {
        //Check to see if total cash/card paid amounts are same as total cost
        //If it is, mark the order as complete automatically
        const orderId = handleTableRow.currentRowEditing.getAttribute("data-oid");

        //If the user is an admin, check if they are editing their own order or someone else's
        let needsUserInfo = false;
        if (userRole.role === "leader" && !allOrderData.find(order => order.id === orderId)) {
            //They are editing someone else's so get their user info and load it if need phone #
            orderData.ownerId = allOrderData.find(order => order.trooperId === tId).ownerId;
            orderData.ownerName = allOrderData.find(order => order.trooperId === tId).ownerName;
            orderData.ownerEmail = allOrderData.find(order => order.trooperId === tId).ownerEmail;
            if (contact === "Phone") {
                needsUserInfo = true;
            } else {
                orderData.contact = orderData.ownerEmail;
            }
        }

        // Get total cost from current row data
        const currentOrderData = getRowData(handleTableRow.currentRowEditing, false);
        const totalOrderCost = parseFloat(currentOrderData.totalCost.replace(/[^0-9.-]+/g, ""));
        const totalPaid = cash + card;
        orderData.orderContent.owe = totalOrderCost - totalPaid;

        // Check if payment equals total cost
        if (Math.abs(totalOrderCost - totalPaid) < 0.01) { // Using small epsilon for float comparison
            updateOrderThenComplete(orderData, orderId, needsUserInfo);
        } else {
            updateOrderApi(orderData, orderId, needsUserInfo, true);
        }
    }
});

async function createOrderApi(orderData) {
    manageLoader(true);

    try {
        const orderInfo = await callApi('/order', 'POST', orderData);
        //Order created, add to table and show message
        orderData.status = orderInfo.status;
        orderData.orderContent.totalCost = orderData.orderContent.totalCost.toLocaleString("en-US", { style: "currency", currency: "USD" });
        orderData.cashPaid = orderData.cashPaid.toLocaleString("en-US", { style: "currency", currency: "USD" });
        orderData.cardPaid = orderData.cardPaid.toLocaleString("en-US", { style: "currency", currency: "USD" });
        orderData.orderContent.owe = orderData.orderContent.owe.toLocaleString("en-US", { style: "currency", currency: "USD" });
        handleTableRow.currentOrder(orderInfo.id, orderData, editCurrentOrder, createModals.deleteItem(deleteCurrentOrder), createModals.pickupOrder(markOrderAsPickedUp));
        showToast("Order Added", "A new order has been created for your account.", STATUS_COLOR.GREEN, true, 5);
    } catch (error) {
        console.error('Error creating order:', error);
        showToast("Error Creating Order", 'There was an error with creating this order. Please try again.', STATUS_COLOR.RED, true, 5);
    }

    manageLoader(false);
    orderClose.click();
}

async function updateOrderApi(orderData, orderId, needsUserInfo, isPaymentUpdate = false) {
    manageLoader(true);

    try {
        //Only need to get user info if leader is updating someone else's order and they need the phone #
        if (needsUserInfo) {
            const userInfo = await callApi(`/user/${orderData.ownerId}`);
            orderData.contact = userInfo.phone;
        }
        const subroute = isPaymentUpdate ? `/orderPayment/${orderId}` : `/order/${orderId}`;
        await callApi(subroute, 'PUT', orderData);
        //Order updated, update data in table and show message
        orderData.orderContent.totalCost = orderData.orderContent.totalCost.toLocaleString("en-US", { style: "currency", currency: "USD" });
        orderData.cashPaid = orderData.cashPaid.toLocaleString("en-US", { style: "currency", currency: "USD" });
        orderData.cardPaid = orderData.cardPaid.toLocaleString("en-US", { style: "currency", currency: "USD" });
        orderData.orderContent.owe = (orderData.orderContent.owe || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
        handleTableRow.updateOrderRow(handleTableRow.currentRowEditing, orderData);
        showToast("Order Updated", "The selected order has been updated with the new information.", STATUS_COLOR.GREEN, true, 5);
    } catch (error) {
        console.error('Error updating order:', error);
        showToast("Error Updating Order", 'There was an error with updating this order. Please try again.', STATUS_COLOR.RED, true, 5);
    }

    manageLoader(false);
    orderClose.click();
}
//#endregion --------------------------------------------------------

//#region TABLE ACTIONS ---------------------------------------------
async function markOrderAsPickedUp() {
    manageLoader(true);

    try {
        const orderId = handleTableRow.currentRowEditing.getAttribute("data-oid");
        await callApi(`/orderPickup/${orderId}`, 'PUT', { ownerEmail: userData.email });
        //Order marked as picked up, update table and show message
        // Get total cost from current row data
        const currentOrderData = getRowData(handleTableRow.currentRowEditing, false);
        const totalOrderCost = parseFloat(currentOrderData.totalCost.replace(/[^0-9.-]+/g, ""));
        const cashPaid = parseFloat(currentOrderData.cashPaid.replace(/[^0-9.-]+/g, ""));
        const cardPaid = parseFloat(currentOrderData.cardPaid.replace(/[^0-9.-]+/g, ""));
        const totalPaid = cashPaid + cardPaid;
        handleTableRow.currentRowEditing.children[1].textContent = "Picked Up";
        handleTableRow.currentRowEditing.children[7].textContent = (totalOrderCost - totalPaid).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        let actions = [
            { title: "Edit Paid Amounts", iconClass: "fa-file-invoice-dollar text-blue hover:text-blue-light", action: editOrderPaidAmounts },
            { title: "Delete", iconClass: "fa-trash-can text-red hover:text-red-light", action: createModals.deleteItem(deleteCurrentOrder) }
        ]
        handleTableRow.updateOrderActions(handleTableRow.currentRowEditing, actions);
        showToast("Order Picked Up", "The selected order has been marked as picked up.", STATUS_COLOR.GREEN, true, 5);
    } catch (error) {
        console.error('Error marking order as picked up:', error);
        showToast("Error Marking Pickup", 'There was an error with setting this order as picked up. Please try again.', STATUS_COLOR.RED, true, 5);
    }

    manageLoader(false);
}

async function completeCurrentOrder() {
    manageLoader(true);

    try {
        const orderId = handleTableRow.currentRowEditing.getAttribute("data-oid");
        await callApi(`/orderComplete/${orderId}`, 'PUT');
        //Order marked as completed, update tables and show message
        const orderData = getRowData(handleTableRow.currentRowEditing, true, true, true);
        orderData.status = "Completed";
        handleTableRow.completedOrder(orderId, orderData, userRole.role === "leader" ? createModals.deleteItem(deleteCompletedOrder) : null);
        handleTableRow.currentRowEditing.remove();
        showToast("Order Completed", "The selected order has been completed and moved to the Completed Orders table.", STATUS_COLOR.GREEN, true, 5);
    } catch (error) {
        console.error('Error marking order as complete:', error);
        showToast("Error Marking Complete", 'There was an error with setting this order as completed. Please try again.', STATUS_COLOR.RED, true, 5);
    }

    manageLoader(false);
}

async function updateOrderThenComplete(orderData, orderId, needsUserInfo) {
    try {
        //Update order first
        await updateOrderApi(orderData, orderId, needsUserInfo, true);

        //Then mark it as complete
        await completeCurrentOrder();
    } catch (error) {
        console.error('Error updating order:', error);
        showToast("Error Updating Order", 'There was an error with updating this order. Please try again.', STATUS_COLOR.RED, true, 5);
    }

    orderClose.click();
}

function editCurrentOrder() {
    openOrderModal("edit", getRowData(handleTableRow.currentRowEditing, false));
}

function editOrderPaidAmounts() {
    openOrderModal("edit-amounts", getRowData(handleTableRow.currentRowEditing, false));
}

async function deleteCurrentOrder() {
    manageLoader(true);

    try {
        //Delete the order from the database and remove from the table
        const orderId = handleTableRow.currentRowEditing.getAttribute('data-oid');
        await callApi(`/order/${orderId}`, 'DELETE');
        //Order deleted, remove from tables and show message
        handleTableRow.currentRowEditing.remove();
        showToast("Order Deleted", "The selected order has been removed.", STATUS_COLOR.GREEN, true, 5);
    } catch (error) {
        console.error('Error deleting order:', error);
        showToast("Error Deleting Order", 'There was an error with deleting this order. Please try again.', STATUS_COLOR.RED, true, 5);
    }

    manageLoader(false);
}

async function deleteCompletedOrder() {
    manageLoader(true);

    try {
        //Delete the order from the database and remove from the table
        const orderId = handleTableRow.currentRowEditing.getAttribute('data-oid');
        await callApi(`/order/${orderId}`, 'DELETE');
        //Order deleted, remove from tables and show message
        handleTableRow.currentRowEditing.remove();
        showToast("Order Deleted", "The selected order has been removed.", STATUS_COLOR.GREEN, true, 5);
    } catch (error) {
        console.error('Error deleting order:', error);
        showToast("Error Deleting Order", 'There was an error with deleting this order. Please try again.', STATUS_COLOR.RED, true, 5);
    }

    manageLoader(false);
}

function getRowData(row, isCompletedOrders = false, needsDate = false, needsCookieArray = false) {
    // Exclude the last <td> (actions)
    let tds = Array.from(row.children).slice(0, -1);
    let index = 0;

    let orderData = {
        dateCreated: tds[index++]?.textContent.trim(),
        status: tds[index++]?.textContent.trim(),
        ...(isCompletedOrders ? {
            dateCompleted: needsDate ? new Date().toLocaleDateString('en-US') : tds[index++]?.textContent.trim()
        } : null),
        trooperName: tds[index++]?.textContent.trim(),
        ownerName: tds[index++]?.textContent.trim(),
        buyerEmail: tds[index++]?.textContent.trim(),
        boxTotal: Number(tds[index++]?.textContent.trim()) || 0,
        totalCost: tds[index++]?.textContent.trim(),
        owe: tds[index++]?.textContent.trim(),
    };

    // Get cookie data dynamically from troopInventoryData
    const troopInventoryData = JSON.parse(sessionStorage.getItem('troopInventoryData'));
    if (troopInventoryData?.inventory) {
        if (needsCookieArray) {
            orderData.orderContent = {
                cookies: [],
            };

            // Build cookies array
            troopInventoryData.inventory.forEach(cookie => {
                const boxes = Number(tds[index++]?.textContent.trim()) || 0;
                if (boxes > 0) {
                    orderData.orderContent.cookies.push({
                        variety: cookie.variety,
                        boxes: boxes,
                    });
                }
            });
        } else {
            orderData.orderContent = {};
            troopInventoryData.inventory.forEach(cookie => {
                const fieldName = cookie.variety.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
                orderData.orderContent[fieldName] = Number(tds[index++]?.textContent.trim()) || 0;
            });
        }
    }

    // Get the remaining fields after cookie data
    orderData.pickupLocation = tds[index++]?.textContent.trim();
    orderData.contact = tds[index++]?.textContent.trim();
    orderData.cashPaid = tds[index++]?.textContent.trim();
    orderData.cardPaid = tds[index++]?.textContent.trim();
    orderData.financialAgreement = tds[index++]?.textContent.trim();

    return orderData;
}

//#endregion TABLE ACTIONS ------------------------------------------