//Table headers & row data fields
const tableSchemas = {
    orders: {
        staticHeaders: ["Date Created", "Status", "Trooper Name", "Parent Name", "Buyer Email", "Box Total", "Total Cost", "Amount Owed"],
        staticFields: ["dateCreated", "status", "trooperName", "ownerName", "buyerEmail", "boxTotal", "totalCost", "owe"],
        footerHeaders: ["Pickup Location", "Contact Preference", "Cash Paid", "Card Paid", "Financial Agreement"],
        footerFields: ["pickupLocation", "contact", "cashPaid", "cardPaid", "financialAgreement"]
    },
    completedOrders: {
        staticHeaders: ["Date Created", "Status", "Date Completed", "Trooper Name", "Parent Name", "Buyer Email", "Box Total", "Total Cost", "Amount Owed"],
        staticFields: ["dateCreated", "status", "dateCompleted", "trooperName", "ownerName", "buyerEmail", "boxTotal", "totalCost", "owe"],
        footerHeaders: ["Pickup Location", "Contact Preference", "Cash Paid", "Card Paid", "Financial Agreement"],
        footerFields: ["pickupLocation", "contact", "cashPaid", "cardPaid", "financialAgreement"]
    },
    inventory: {
        headers: ["Cookie Name", "Boxes in Stock", "Price Per Box"],
        fields: ["variety", "boxes", "boxPrice"]
    },
    inventoryNeed: {
        headers: ["Cookie Name", "Boxes Needed"],
        fields: ["variety", "boxes"]
    },
    troopers: {
        headers: [
            "", "Troop Number", "Trooper Name", "Parent Name", "Troop Leader", "Amount Owed", "Boxes Sold", "Age", "Grade", "Shirt/Jacket Size"
        ],
        fields: [
            "troopNumber", "trooperName", "parentName", "troopLeader", "owe", "boxesSold", "age", "grade", "shirtSize"
        ]
    },
    files: {
        headers: ["File Name", "File Size", "Date Uploaded"],
        fields: ["fileName", "fileSize", "dateUploaded"]
    },
    rewards: {
        headers: ["Reward Name", "Description", "Boxes Needed", "Choices", "Image"],
        fields: ["name", "description", "boxesNeeded", "choices", "downloadUrl"]
    },
    selectedRewards: {
        headers: ["Reward Name", "Description", "Choice Selected", "Data Selected"],
        fields: ["name", "description", "selectedChoice", "selectedAt"]
    }
};

//#region TABLE CREATION --------------------------------------------
const handleTableCreation = {
    currentOrder: (parent, action) => createCurrentOrdersTable(parent, action),
    completedOrder: (parent) => createCompletedOrdersTable(parent),
    trooperInventory: (parent, trooperData, action) => createTrooperInventoryTable(parent, trooperData, action),
    yourInventory: (parent) => createYourInventoryTable(parent),
    troopInventory: (parent, action) => createTroopInventoryTable(parent, action),
    needInventory: (parent) => createNeedInventoryTable(parent),
    yourTrooper: (parent, action) => createYourTrooperTable(parent, action),
    allTrooper: (parent) => createAllTrooperTable(parent),
    yourDocuments: (parent, action) => createYourDocumentsTable(parent, action),
    troopRewards: (parent, action) => createTroopRewardsTable(parent, action),
    rewardBox: (parent, trooperData, rewardData, action) => createRewardBox(parent, trooperData, rewardData, action),
    monthlyCookie: (parent, cookieData) => createMonthlyCookie(parent, cookieData),
    statBox: (parent, statData) => createStatsBox(parent, statData),
}

const tableFilters = {
    search: (searchId) => {
        return `
            <div class="flex relative w-full">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <i class="fa-solid fa-magnifying-glass w-4 h-4 text-black dark:text-white"></i>
                </div>
                <input type="search" id="${searchId}-search" placeholder="Search by trooper or parent names"
                    class="block w-full p-2 ps-10 text-sm text-black dark:text-white border-2 border-gray rounded-default bg-white dark:bg-black focus:ring-green focus:border-green outline-none"
                />
            </div>
        `;
    },
    dates: (startId, endId) => {
        return `
            <div class="flex items-center gap-4 max-sm:w-full sm:col-span-2 xl:col-span-1 xl:order-2">
                <div class="relative flex-1 min-w-0">
                    <label for="${startId}-datestart"
                        class="absolute text-sm text-green left-1 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-black px-2">
                        Start date
                    </label>
                    <input id="${startId}-datestart" name="start" type="date"
                        class="block w-full min-w-0 p-2.5 bg-white dark:bg-black border-2 border-gray text-black dark:text-white text-sm rounded-default focus:ring-green focus:border-green outline-none appearance-none">
                </div>
                <span class="text-black dark:text-white">to</span>
                <div class="relative flex-1 min-w-0">
                    <label for="${endId}-dateend"
                        class="absolute text-sm text-green left-1 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-black px-2">
                        End date
                    </label>
                    <input id="${endId}-dateend" name="end" type="date"
                        class="block w-full min-w-0 p-2.5 bg-white dark:bg-black border-2 border-gray text-black dark:text-white text-sm rounded-default focus:ring-green focus:border-green outline-none appearance-none">
                </div>
            </div>
        `;
    },
    clear: (clearId) => {
        return `
            <div class="flex relative sm:w-auto max-sm:order-3 xl:justify-self-auto xl:order-3">
                <button id="${clearId}-clear-filters" type="button"
                    class="w-full shadow-default py-1 px-2 text-lg tracking-wide rounded-default text-white bg-blue hover:bg-blue-light accent-gray">
                    Clear Filters
                </button>
            </div>
        `;
    }
}

function buildDynamicOrderFields(cookies) {
    const headers = [];
    const fields = [];

    cookies.forEach(cookie => {
        headers.push(`# ${cookie.variety}`);
        // Convert variety name to camelCase for field name
        fields.push(cookie.variety.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()));
    });

    return { headers, fields };
}

function createTable(parent, title, icon, filters, fields, button, removeActions = false, needsOweAmount = false) {
    let filtersClass = (filters !== null && filters.length > 1) ? "grid grid-cols-1 sm:grid-cols-[auto_auto] xl:grid-cols-[40%_auto_auto] gap-4" : "flex";
    let filtersContainer = "", buttonContainer = "", titleContainer = "";

    if (filters !== null) {
        filtersContainer = `
            <div id="${title.replaceAll(' ', '-').toLowerCase() + "-filters"}" class="${filtersClass} mb-4 items-center">
                ${filters.map(filter => filter).join('')}
            </div>
        `;
    }

    if (button) {
        buttonContainer = `
            <div class="flex justify-end mt-2">
                <button id="${button.id}" type="button" class="w-auto shadow-default py-3 px-4 text-xl tracking-wide rounded-default text-white bg-orange hover:bg-orange-light accent-green">
                    <i class="fa-solid fa-${button.icon}"></i> ${button.title}
                </button>
            </div>
        `;
    }

    if (needsOweAmount) {
        titleContainer = `
            <div class="grid grid-cols-1 lg:grid-cols-[auto_auto] gap-4">
                <h2 class="text-green text-4xl max-sm:text-2xl font-extrabold lg:mb-8">
                    <i class="fa-solid fa-${icon}"></i> ${title}
                </h2>
                <h2 id="${title.replaceAll(' ', '-').toLowerCase() + "-owe"}" class="text-orange text-4xl max-sm:text-2xl font-extrabold mb-8 lg:justify-self-end"> </h2>
            </div>
        `;
    } else {
        titleContainer = `
            <h2 class="text-green text-4xl max-sm:text-2xl font-extrabold mb-8">
                <i class="fa-solid fa-${icon}"></i> ${title}
            </h2>
        `;
    }

    const container = document.createElement('div');
    container.className = "need-skeleton hidden mt-12 mb-6 px-2";
    container.innerHTML = `
        <div class="bg-white dark:bg-black py-6 px-4 max-w-[120rem] relative shadow-default mx-auto rounded-default">
            ${titleContainer}
            ${filtersContainer}
            <div class="overflow-auto pb-4 max-h-[48rem]">
                <table class="min-w-full border-separate border-spacing-0 border-4 border-green rounded-default">
                    <thead class="bg-green whitespace-nowrap sticky top-0">
                        <tr class="text-left text-lg text-white [&_th]:p-4 [&_th]:font-normal">
                            ${fields.map(field => `<th>${field}</th>`).join('')}
                            ${!removeActions ? '<th>Actions</th>' : ''}
                        </tr>
                    </thead>
                    <tbody id="${title.replaceAll(' ', '-').toLowerCase() + "-tbody"}" class="whitespace-nowrap"></tbody>
                </table>
            </div>
            ${buttonContainer}
        </div>
    `;
    parent.appendChild(container);

    // **Bind event listener dynamically**
    if (button && button.action) {
        const btn = document.getElementById(button.id);
        if (btn) {
            btn.addEventListener("click", button.action);
        }
    }
}

function createTrooperHiddenTable(parent, title, tbodyId, fields) {
    const container = document.createElement('div');
    container.className = "bg-white dark:bg-black py-6 px-4 max-w-[120rem] shadow-default my-6 rounded-default";
    container.innerHTML = `
        <h2 class="text-green text-4xl max-sm:text-2xl font-extrabold mb-8">
            ${title}
        </h2>
        <div class="overflow-auto pb-4 max-h-96">
            <table class="min-w-full border-separate border-spacing-0 border-4 border-green rounded-default">
                <thead class="bg-green whitespace-nowrap sticky top-0">
                    <tr class="text-left text-lg text-white [&_th]:p-4 [&_th]:font-normal">
                        ${fields.map(field => `<th>${field}</th>`).join('')}
                    </tr>
                </thead>
                <tbody id="${tbodyId + "-tbody"}" class="whitespace-nowrap"></tbody>
            </table>
        </div>
    `;
    parent.appendChild(container);
}

function createCurrentOrdersTable(parent, action) {
    const title = "Current Orders";
    const icon = "hourglass-half"
    const filterIds = "current-orders";
    const filters = [
        tableFilters.search(filterIds),
        tableFilters.clear(filterIds),
        tableFilters.dates(filterIds, filterIds)
    ];
    const button = {
        id: "add-order",
        title: "Add New Order",
        icon: "cart-plus",
        action: () => action("add")
    }

    // Get cookie fields from sessionStorage
    const troopInventoryData = JSON.parse(sessionStorage.getItem('troopInventoryData'));
    const { headers: cookieHeaders, fields: cookieFields } = buildDynamicOrderFields(troopInventoryData?.inventory || []);

    // Combine all headers and fields
    const allHeaders = [
        ...tableSchemas.orders.staticHeaders,
        ...cookieHeaders,
        ...tableSchemas.orders.footerHeaders
    ];

    createTable(parent, title, icon, filters, allHeaders, button);
}

function createCompletedOrdersTable(parent) {
    const title = "Completed Orders";
    const icon = "clipboard-check"
    const filterIds = "completed-orders";
    const filters = [
        tableFilters.search(filterIds),
        tableFilters.clear(filterIds),
        tableFilters.dates(filterIds, filterIds)
    ];

    // Get cookie fields from sessionStorage
    const troopInventoryData = JSON.parse(sessionStorage.getItem('troopInventoryData'));
    const { headers: cookieHeaders, fields: cookieFields } = buildDynamicOrderFields(troopInventoryData?.inventory || []);

    // Combine all headers and fields
    const allHeaders = [
        ...tableSchemas.completedOrders.staticHeaders,
        ...cookieHeaders,
        ...tableSchemas.completedOrders.footerHeaders
    ];

    createTable(parent, title, icon, filters, allHeaders, null);
}

function createTrooperInventoryTable(parent, trooperData, action) {
    const title = `Inventory for ${trooperData.trooperName}`;
    const icon = "box";
    /* let button = {
        id: `add-${trooperData.trooperName.replace(' ', '-').toLowerCase()}-cookies`,
        title: "Assign Cookies",
        icon: "cookie-bite",
        action: () => action("add", null, trooperData.id)
    } */
    createTable(parent, title, icon, null, tableSchemas.inventory.headers, null, true, true);

    const tbody = document.getElementById(title.replaceAll(' ', '-').toLowerCase() + "-tbody");
    tbody.setAttribute("data-tid", trooperData.id);
}

function createYourInventoryTable(parent) {
    const title = "Your Inventory";
    const icon = "box"
    createTable(parent, title, icon, null, tableSchemas.inventory.headers, null, true, true);
}

function createTroopInventoryTable(parent, action) {
    const title = "Troop Inventory";
    const icon = "boxes-stacked";
    let button = null;
    let removeAction = true;
    if (action) {
        removeAction = false;
        button = {
            id: "add-troop-cookies",
            title: "Add New Cookies",
            icon: "cookie-bite",
            action: () => action("add")
        }
    }
    createTable(parent, title, icon, null, tableSchemas.inventory.headers, button, removeAction);
}

function createNeedInventoryTable(parent) {
    const title = "Need To Order";
    const icon = "truck-ramp-box"
    createTable(parent, title, icon, null, tableSchemas.inventoryNeed.headers, null);
}

function createYourTrooperTable(parent, action) {
    const title = "Your Troopers";
    const icon = "user"
    const button = {
        id: "add-trooper",
        title: "Add Trooper",
        icon: "user-plus",
        action: () => action("add")
    }
    createTable(parent, title, icon, null, tableSchemas.troopers.headers, button);
}

function createAllTrooperTable(parent) {
    const title = "All Troopers";
    const icon = "users"
    const filters = [tableFilters.search("all-troopers")];
    createTable(parent, title, icon, filters, tableSchemas.troopers.headers);
}

function createYourDocumentsTable(parent, action) {
    const title = "Your Documents";
    const icon = "folder-open"
    const button = {
        id: "upload-files",
        title: "Upload Files",
        icon: "cloud-arrow-up",
        action: action
    }
    createTable(parent, title, icon, null, tableSchemas.files.headers, button);
}

function createTroopRewardsTable(parent, action) {
    const title = "Troop Rewards";
    const icon = "gifts"
    const button = {
        id: "add-reward",
        title: "Add Reward",
        icon: "gift",
        action: () => action("add")
    }
    createTable(parent, title, icon, null, tableSchemas.rewards.headers, button);
}

function createRewardBox(parent, trooperData, rewardData, action) {
    const rewards = (reward, boxesSold, trooperId) => {
        let btnClass = "bg-gray text-black", btnText = "Locked", disabled = "disabled";

        if (reward.redeemed === "Redeemed") {
            btnText = "Redeemed: " + reward.selectedChoice;
            btnClass = "bg-green-super-light text-black";
        } else if (!reward.hasOwnProperty('redeemed') && reward.boxesNeeded <= boxesSold) {
            btnText = "Redeem";
            btnClass = "bg-green text-white hover:bg-green-light";
            disabled = "";
        }

        return `
        <div class="bg-white dark:bg-black rounded-default shadow-default w-72 overflow-hidden mx-auto flex flex-col">
            <div class="h-56">
                <img src=${reward.downloadUrl} class="w-full h-full object-cover" />
            </div>
            <div class="p-4 flex flex-col flex-grow justify-between">
                <div>
                    <p class="text-xl text-green">${reward.name}</p>
                    <p class="text-xs text-black dark:text-white mt-2">${reward.description ? reward.description : "&nbsp;"}</p>
                    <p class="text-3xl text-orange mt-2">${reward.boxesNeeded}+ Boxes</p>
                </div>
                <button id=${trooperId + "-" + reward.id} data-tid=${trooperId} data-rid=${reward.id}
                    class="redeem-btn mt-2 w-full py-2 rounded-default shadow-default ${btnClass}" ${disabled}>${btnText}
                </button>
            </div>
        </div>
    `};

    const container = document.createElement('div');
    container.className = "need-skeleton hidden mt-12 mb-6 px-2";
    container.innerHTML = `
        <div class="max-w-[120rem] mx-auto bg-white dark:bg-black rounded-default shadow-default p-6">
            <h2 class="text-green text-4xl max-sm:text-2xl font-extrabold mb-8">
                <i class="fa-solid fa-award"></i>Rewards for ${trooperData.trooperName}
            </h2>

            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg text-green mb-2">Rewards Available</h3>
                    <div class="bg-white dark:bg-black p-6 rounded-default shadow-default">
                        <div class="flex flex-col justify-center items-center h-full pb-4">
                            <div
                                class="flex flex-row justify-center items-center gap-5 max-[320px]:flex-col">
                                <i class="fa-solid fa-gift text-3xl text-orange"></i>
                                <h4 id=${trooperData.id + "-available"} class="text-7xl font-bold text-orange max-sm:text-5xl">${trooperData.available}</h4>
                            </div>
                            <p class="text-sm text-black dark:text-white mt-2 text-center">Sell more boxes to earn more
                                rewards!
                            </p>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 class="text-lg text-green mb-2">Boxes Sold</h3>
                    <div class="bg-white dark:bg-black p-6 rounded-default shadow-default">
                        <div class="flex flex-col justify-center items-center h-full pb-4">
                            <div
                                class="flex flex-row justify-center items-center gap-5 max-[320px]:flex-col">
                                <i class="fa-solid fa-boxes-stacked text-3xl text-orange"></i>
                                <h4 class="text-7xl font-bold text-orange max-sm:text-5xl">${trooperData.boxesSold}</h4>
                            </div>
                            <p class="text-sm text-black dark:text-white mt-2 text-center">Keep selling your boxes for more
                                rewards!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <h3 class="text-lg text-green mt-6 mb-2">Redeem</h3>
            <div class="overflow-x-auto mt-4">
                <div class="flex flex-row gap-4 p-[0_5px_10px] w-max">
                    ${rewardData ?
            rewardData.map(reward => rewards(reward, trooperData.boxesSold, trooperData.id)).join('')
            : `<p class="text-sm text-black mt-2 text-center">No rewards available.</p>`}
                </div>
            </div>
        </div>
    `;
    parent.appendChild(container);

    // Attach event listeners after elements are added to the DOM
    container.querySelectorAll(".redeem-btn").forEach(button => {
        button.addEventListener("click", (event) => {
            handleTableRow.currentRowEditing = button;
            const rewardId = event.target.dataset.rid;
            action(rewardId);
        });
    });
}

function createMonthlyCookie(parent, cookieData) {
    const container = document.createElement('div');
    container.className = "need-skeleton hidden mt-12 mb-6 px-2";
    container.innerHTML = `
        <div class="bg-green relative max-w-[120rem] shadow-default mx-auto rounded-default overflow-hidden">
            <div class="grid sm:grid-cols-2 max-sm:gap-6">
                <div class="text-center p-6 flex flex-col justify-center items-center">
                    <h3 class="font-extrabold text-5xl text-white leading-tight">Monthly Cookie</h3>
                    <h6 class="text-lg text-white mt-4">Suggested Cookie of the Month</h6>
                    <h6 class="text-3xl text-white mt-4 underline decoration-wavy decoration-orange decoration-2">
                        ${cookieData.name}
                    </h6>
                </div>

                <div class="flex justify-end max-sm:justify-center items-center p-2 bg-gradient-to-b from-orange to-orange-light rounded-bl-[230px] max-sm:rounded-bl-none w-full h-full">
                    <div class="h-72 w-72 rounded-full bg-gradient-to-tr from-orange to-orange-light p-5">
                        <img src=${cookieData.image} class="w-full h-full rounded-full object-contain border-8 border-white bg-white" alt="Monthly Cookie" />
                    </div>
                </div>
            </div>

            <div class="absolute -top-[50px] -left-[50px] w-28 h-28 rounded-full bg-orange opacity-40 shadow-lg"></div>
            <div class="absolute -top-10 -left-10 w-28 h-28 rounded-full bg-orange opacity-40 shadow-lg"></div>
        </div>
    `;
    parent.appendChild(container);
}

function createStatsBox(parent, statData) {
    const stats = (stat) => {
        return `
        <div class="bg-white dark:bg-black rounded-default border border-off-white dark:border-black-light shadow-default px-7 py-8">
            <p class="text-black dark:text-white text-base font-semibold mb-1">${stat.title}</p>
            <h3 class="text-green text-3xl font-extrabold">${stat.stat}</h3>
        </div>
    `};

    const container = document.createElement('div');
    container.className = "need-skeleton hidden mt-12 mb-6 px-2";
    container.innerHTML = `
        <div class="bg-white dark:bg-black px-4 py-12 rounded-default shadow-default max-w-[120rem] m-auto">
            <div class="max-sm:max-w-sm mx-auto">
                <h2 class="text-green text-4xl max-sm:text-2xl font-extrabold mb-8"><i
                        class="fa-solid fa-chart-line"></i> ${statData.id} Current Statistics</h2>
                <div class="grid 2xl:grid-cols-4 md:grid-cols-2 gap-5">
                    ${statData.stats.map(stat => stats(stat)).join('')}
                </div>
            </div>
        </div>
    `;
    parent.appendChild(container);
}
//#endregion TABLE CREATION -----------------------------------------

//#region TABLE FILTERS ---------------------------------------------
const searchTableRows = {
    currentOrders: (searchId, startDateId, endDateId, clearId) => setupTableFilters(searchId, startDateId, endDateId, clearId, searchCurrentOrderRows),
    completedOrders: (searchId, startDateId, endDateId, clearId) => setupTableFilters(searchId, startDateId, endDateId, clearId, searchCompletedOrderRows),
    allTroopers: (searchId) => setupTableFilters(searchId, null, null, null, searchAllTrooperRows),
}

function setupTableFilters(searchId, startDateId, endDateId, clearId, searchAction) {
    const search = document.getElementById(searchId);
    const startDate = document.getElementById(startDateId);
    const endDate = document.getElementById(endDateId);
    const clear = document.getElementById(clearId);

    function searchFunction() {
        const searchData = search?.value.trim();
        const startDateData = startDate?.value;
        const endDateData = endDate?.value;

        searchAction(searchData, startDateData, endDateData);
    }

    //Setup event listeners for inputs and clear button
    search?.addEventListener('input', searchFunction, false);
    startDate?.addEventListener('input', searchFunction, false);
    endDate?.addEventListener('input', searchFunction, false);
    clear?.addEventListener('click', () => {
        search.value = "";
        startDate.value = "";
        endDate.value = "";
        searchFunction();
    });
}

function parseLocalDate(dateString) {
    if (!dateString) return null;
    const parts = dateString.split("-"); // Expected format: YYYY-MM-DD
    return new Date(parts[0], parts[1] - 1, parts[2]); // Month is zero-based
};

function searchCurrentOrderRows(searchName, startDate, endDate) {
    const tbody = document.getElementById("current-orders-tbody");
    const rows = tbody.getElementsByTagName("tr");

    //Convert string dates to Date objects in LOCAL TIME
    const start = parseLocalDate(startDate);
    let end = parseLocalDate(endDate);

    //Adjust end date to include the full day
    if (end) end.setHours(23, 59, 59, 999);

    Array.from(rows).forEach(row => {
        const cells = row.getElementsByTagName("td");

        //Get values from specific <td> cells
        const dateCreatedText = cells[0].textContent.trim();
        const trooperNameText = cells[2].textContent.trim();
        const parentNameText = cells[3].textContent.trim();

        //Convert table date to a local Date object
        const dateParts = dateCreatedText.split("/"); // Expected format: MM/DD/YYYY
        const dateCreatedDate = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);

        //Check if the name matches (case-insensitive)
        const nameSearchActive = searchName.trim() !== "";
        const trooperNameMatch = nameSearchActive && trooperNameText.toLowerCase().includes(searchName.toLowerCase());
        const parentNameMatch = nameSearchActive && parentNameText.toLowerCase().includes(searchName.toLowerCase());
        const nameMatches = nameSearchActive ? (trooperNameMatch || parentNameMatch) : true;

        //Check if the date falls within the range
        let dateMatches = true;
        if (start && end) {
            dateMatches = dateCreatedDate >= start && dateCreatedDate <= end;
        } else if (start) {
            dateMatches = dateCreatedDate >= start;
        } else if (end) {
            dateMatches = dateCreatedDate <= end;
        }

        //Show or hide the row based on conditions
        if (nameMatches && dateMatches) {
            row.classList.remove("hidden");
        } else {
            row.classList.add("hidden");
        }
    });
}

function searchCompletedOrderRows(searchName, startDate, endDate) {
    const tbody = document.getElementById(`completed-orders-tbody`);
    const rows = tbody.getElementsByTagName("tr");

    //Convert string dates to Date objects in LOCAL TIME
    const start = parseLocalDate(startDate);
    let end = parseLocalDate(endDate);

    //Adjust end date to include the full day
    if (end) end.setHours(23, 59, 59, 999);

    Array.from(rows).forEach(row => {
        const cells = row.getElementsByTagName("td");

        //Get values from specific <td> cells
        const dateCreatedText = cells[0].textContent.trim();
        const dateCompletedText = cells[2].textContent.trim();
        const trooperNameText = cells[3].textContent.trim();
        const parentNameText = cells[4].textContent.trim();

        //Convert table date to a local Date object
        const dateCreatedParts = dateCreatedText.split("/"); //Expected format: MM/DD/YYYY
        const dateCompletedParts = dateCompletedText.split("/") //Expected format: MM/DD/YYYY
        const dateCreatedDate = new Date(dateCreatedParts[2], dateCreatedParts[0] - 1, dateCreatedParts[1]);
        const dateCompletedDate = new Date(dateCompletedParts[2], dateCompletedParts[0] - 1, dateCompletedParts[1]);

        //Check if the name matches (case-insensitive)
        const nameSearchActive = searchName.trim() !== "";
        const trooperNameMatch = nameSearchActive && trooperNameText.toLowerCase().includes(searchName.toLowerCase());
        const parentNameMatch = nameSearchActive && parentNameText.toLowerCase().includes(searchName.toLowerCase());
        const nameMatches = nameSearchActive ? (trooperNameMatch || parentNameMatch) : true;

        //Check if either date falls within the range
        let dateMatches = true;
        if (start && end) {
            dateMatches =
                (dateCreatedDate && dateCreatedDate >= start && dateCreatedDate <= end) ||
                (dateCompletedDate && dateCompletedDate >= start && dateCompletedDate <= end);
        } else if (start) {
            dateMatches =
                (dateCreatedDate && dateCreatedDate >= start) ||
                (dateCompletedDate && dateCompletedDate >= start);
        } else if (end) {
            dateMatches =
                (dateCreatedDate && dateCreatedDate <= end) ||
                (dateCompletedDate && dateCompletedDate <= end);
        }

        //Show or hide the row based on conditions
        if (nameMatches && dateMatches) {
            row.classList.remove("hidden");
        } else {
            row.classList.add("hidden");
        }
    });
}

function searchAllTrooperRows(searchName) {
    const tbody = document.getElementById(`all-troopers-tbody`);
    const unfilteredRows = tbody.getElementsByTagName("tr");
    const rows = Array.from(unfilteredRows).filter(row => !row.classList.contains("hidden-row"));

    Array.from(rows).forEach(row => {
        const cells = row.getElementsByTagName("td");

        //Get values from specific <td> cells
        const trooperNameText = cells[2].textContent.trim();
        const parentNameText = cells[3].textContent.trim();

        //Check if the name matches (case-insensitive)
        const nameSearchActive = searchName.trim() !== "";
        const trooperNameMatch = nameSearchActive && trooperNameText.toLowerCase().includes(searchName.toLowerCase());
        const parentNameMatch = nameSearchActive && parentNameText.toLowerCase().includes(searchName.toLowerCase());
        const nameMatches = nameSearchActive ? (trooperNameMatch || parentNameMatch) : true;

        //Show or hide the row based on conditions
        if (nameMatches) {
            row.classList.remove("hidden");
        } else {
            row.classList.add("hidden");
        }
    });
}
//#endregion TABLE FILTERS ------------------------------------------

//#region TABLE ROWS ------------------------------------------------
const handleTableRow = {
    currentRowEditing: null,
    currentOrder: (orderId, data, editAction, deleteAction, pickupAction) => addOrderRow(orderId, data, true, editAction, deleteAction, pickupAction),
    completedOrder: (orderId, data, deleteAction) => addOrderRow(orderId, data, false, null, deleteAction, null),
    trooperInventory: (cookieId, data, trooperName, editAction, deleteAction) => addInventoryRow(cookieId, data, `inventory-for-${trooperName}`, editAction, deleteAction),
    yourInventory: (cookieId, data) => addInventoryRow(cookieId, data, "your-inventory", null, null),
    troopInventory: (cookieId, data, editAction, deleteAction) => addInventoryRow(cookieId, data, "troop-inventory", editAction, deleteAction),
    needInventory: (cookieId, data, editAction, deleteAction) => addInventoryRow(cookieId, data, "need-to-order", editAction, deleteAction),
    yourTrooper: (trooperId, data, editAction, deleteAction) => addTrooperRow(trooperId, data, "your", editAction, deleteAction),
    allTrooper: (trooperId, data, editAction, deleteAction) => addTrooperRow(trooperId, data, "all", editAction, deleteAction),
    yourDocuments: (fileUrl, data, downloadAction, deleteAction) => addFileRow(fileUrl, data, downloadAction, deleteAction),
    troopReward: (rewardId, data, editAction, deleteAction) => addRewardRow(rewardId, data, editAction, deleteAction),
    updateOrderRow: (row, data) => editRowData(row, "orders", data),
    updateInventoryRow: (row, data) => editRowData(row, tableSchemas.inventory.fields, data),
    updateTrooperRow: (row, data) => editRowData(row, tableSchemas.troopers.fields, data),
    updateRewardRow: (row, data) => editRowData(row, tableSchemas.rewards.fields, data),
    updateOrderActions: (row, actions) => updateRowActions(row, actions),
}

function setupRowFields(tr, hasDropdown, fields, data, buttons) {
    if (hasDropdown) {
        //Create the dropdown td
        let arrowTd = document.createElement("td");
        arrowTd.className = "show-row !py-[11px] !pl-[18px] !pr-[6px] w-[10px] cursor-pointer";

        let icon = document.createElement("i");
        icon.className = "fa-solid fa-caret-down text-xl";

        arrowTd.addEventListener('click', () => {
            let arrow = arrowTd.querySelector('i');
            let hiddenRow = arrowTd.parentElement.nextElementSibling;

            if (arrow.classList.contains('fa-caret-down')) {
                hiddenRow.classList.remove('hidden');
                arrow.className = 'fa-solid fa-caret-up text-xl';
            } else {
                hiddenRow.classList.add('hidden');
                arrow.className = 'fa-solid fa-caret-down text-xl';
            }
        });

        arrowTd.appendChild(icon);
        tr.appendChild(arrowTd);
    }

    // Populate the row with data fields
    fields.forEach(field => {
        let td = document.createElement("td");
        td.className = "border-l border-gray-light";

        if (field === "downloadUrl") {
            // If field needs to show an image, create an img instead of doing text content
            let img = document.createElement("img");
            img.className = "w-16 md:w-24 max-w-full max-h-full rounded-default shadow-default";
            img.src = data[field];
            img.alt = "Reward Image";
            td.appendChild(img);
        } else {
            let content = "";

            // Check if this is a cookie field in orderContent.cookies
            if (data.orderContent?.cookies) {
                const cookie = data.orderContent.cookies.find(c =>
                    c.variety.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()) === field
                );
                if (cookie) {
                    content = cookie.boxes;
                } else {
                    // Not a cookie field, check orderContent then regular data
                    content = data.orderContent?.[field] ?? data[field] ?? "";
                }
            } else {
                // No orderContent.cookies, just check regular data
                content = data[field] ?? "";
            }

            td.textContent = content;
        }

        tr.appendChild(td);
    });

    if (buttons && buttons.length > 0) {
        // Create the action buttons column
        let actionTd = document.createElement("td");
        actionTd.className = "border-l border-gray-light";

        buttons.forEach(btn => {
            let button = document.createElement("button");
            button.className = "mr-4";
            button.title = btn.title;

            let icon = document.createElement("i");
            icon.className = `fa-solid ${btn.iconClass} text-xl`;

            button.addEventListener('click', (e) => {
                handleTableRow.currentRowEditing = e.target.closest('tr');
                btn.action();
            });

            button.appendChild(icon);
            actionTd.appendChild(button);
        });

        tr.appendChild(actionTd);
    }
}

function addOrderRow(orderId, data, isCurrentOrder, editAction, deleteAction, completeAction) {
    const tableName = isCurrentOrder ? "current" : "completed";
    const tbody = document.getElementById(`${tableName}-orders-tbody`);

    // Get cookie fields from troopInventoryData
    const troopInventoryData = JSON.parse(sessionStorage.getItem('troopInventoryData'));
    const { fields: cookieFields } = buildDynamicOrderFields(troopInventoryData?.inventory || []);

    // Combine all fields in the correct order
    const allFields = [
        ...tableSchemas[isCurrentOrder ? 'orders' : 'completedOrders'].staticFields,
        ...cookieFields,
        ...tableSchemas[isCurrentOrder ? 'orders' : 'completedOrders'].footerFields
    ];

    let tr = document.createElement("tr");
    tr.setAttribute('data-oid', orderId);
    tr.className = "bg-white dark:bg-black even:bg-gray even:dark:bg-black-light text-sm text-black dark:text-white [&_td]:p-4";

    // Button configurations
    // If this is a current order and orderIsCorrect = true, add the complete button otherwise add the pickup button
    let completeActionBtn = false;
    if (isCurrentOrder && data.status === "Picked up") {
        completeActionBtn = { title: "Edit Paid Amounts", iconClass: "fa-file-invoice-dollar text-blue hover:text-blue-light", action: completeAction };
    } else if (isCurrentOrder && data.status === "Ready for pickup") {
        completeActionBtn = { title: "Pickup", iconClass: "fa-truck text-green hover:text-green-light", action: completeAction };
    }
    let buttons = [
        completeActionBtn,
        editAction !== null && { title: "Edit", iconClass: "fa-pen-to-square text-blue hover:text-blue-light", action: editAction },
        deleteAction !== null && { title: "Delete", iconClass: "fa-trash-can text-red hover:text-red-light", action: deleteAction }
    ].filter(Boolean);

    setupRowFields(tr, false, allFields, data, buttons);
    tbody.appendChild(tr);
}

function addInventoryRow(cookieId, data, tbodyId, editAction, deleteAction) {
    const fields = tbodyId === "need-to-order" ? tableSchemas.inventoryNeed.fields : tableSchemas.inventory.fields;
    const tbody = document.getElementById(`${tbodyId}-tbody`);
    let tr = document.createElement("tr");
    tr.setAttribute('data-cid', cookieId);
    tr.className = "bg-white dark:bg-black even:bg-gray even:dark:bg-black-light text-sm text-black dark:text-white [&_td]:p-4";

    // Button configurations
    let buttons = [
        editAction !== null && { title: "Edit", iconClass: "fa-pen-to-square text-blue hover:text-blue-light", action: editAction },
        deleteAction !== null && { title: "Delete", iconClass: "fa-trash-can text-red hover:text-red-light", action: deleteAction }
    ].filter(Boolean);

    setupRowFields(tr, false, fields, data, buttons);
    tbody.appendChild(tr);
}

function addTrooperRow(trooperId, data, tbodyId, editAction, deleteAction) {
    const tbody = document.getElementById(`${tbodyId}-troopers-tbody`);
    let tr = document.createElement("tr");
    tr.setAttribute('data-uid', trooperId);
    tr.className = "bg-white dark:bg-black [&:nth-child(4n-1)]:bg-gray [&:nth-child(4n-1)]:dark:bg-black-light text-sm text-black dark:text-white [&_td]:p-4";

    // Button configurations
    let buttons = [
        { title: "Edit", iconClass: "fa-pen-to-square text-blue hover:text-blue-light", action: editAction },
        { title: "Delete", iconClass: "fa-trash-can text-red hover:text-red-light", action: deleteAction }
    ];

    setupRowFields(tr, true, tableSchemas.troopers.fields, data.trooperData, buttons);
    tbody.appendChild(tr);

    //Now add a hidden row after the main row
    let hiddenTr = document.createElement("tr");
    hiddenTr.className = "hidden-row hidden [&:nth-child(5n-1)]:bg-gray [&:nth-child(5n-1)]:dark:bg-black-light";

    let hiddenTd = document.createElement("td");
    hiddenTd.className = "pl-12 text-sm";
    hiddenTd.colSpan = tableSchemas.troopers.fields.length + 2;

    hiddenTr.appendChild(hiddenTd);
    tbody.appendChild(hiddenTr);

    //Create each of the elements for rewards, and orders
    const lowercaseTrooper = data.trooperData.trooperName.replaceAll(' ', '-').toLowerCase();

    // Get cookie fields from sessionStorage
    const troopInventoryData = JSON.parse(sessionStorage.getItem('troopInventoryData'));
    const { headers: cookieHeaders } = buildDynamicOrderFields(troopInventoryData?.inventory || []);

    // Combine all headers for orders table
    const allOrderHeaders = [
        ...tableSchemas.orders.staticHeaders,
        ...cookieHeaders,
        ...tableSchemas.orders.footerHeaders
    ];

    createTrooperHiddenTable(hiddenTd, `Selected Rewards for ${data.trooperData.trooperName}`, `${tbodyId}-rewards-${lowercaseTrooper}`, tableSchemas.selectedRewards.headers);
    createTrooperHiddenTable(hiddenTd, `Orders for ${data.trooperData.trooperName}`, `${tbodyId}-orders-${lowercaseTrooper}`, allOrderHeaders);

    //Setup the rows for all the tables
    const rewardsTbody = document.getElementById(`${tbodyId}-rewards-${lowercaseTrooper}-tbody`);
    const ordersTbody = document.getElementById(`${tbodyId}-orders-${lowercaseTrooper}-tbody`);

    if (data.rewardData && data.rewardData.length > 0) {
        data.rewardData.forEach((reward) => {
            let tr = document.createElement("tr");
            tr.className = "bg-white dark:bg-black even:bg-gray even:dark:bg-black-light text-sm text-black dark:text-white [&_td]:p-4";

            const rewardData = {
                name: reward.name,
                description: reward.description,
                selectedChoice: reward.selectedChoice,
                selectedAt: new Date(reward.selectedAt).toLocaleDateString("en-US"),
            }
            setupRowFields(tr, false, tableSchemas.selectedRewards.fields, rewardData, null);
            rewardsTbody.appendChild(tr);
        });
    }

    if (data.orderData && data.orderData.length > 0) {
        data.orderData.forEach((order) => {
            let tr = document.createElement("tr");
            tr.className = "bg-white dark:bg-black even:bg-gray even:dark:bg-black-light text-sm text-black dark:text-white [&_td]:p-4";

            // Get all fields in correct order
            const allOrderFields = [
                ...tableSchemas.orders.staticFields,
                ...cookieHeaders.map(header => {
                    const variety = header.replace('# ', '');
                    return variety.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
                }),
                ...tableSchemas.orders.footerFields
            ];

            // Create data object that includes cookie box counts
            const orderData = {
                ...order,
                ...order.orderContent,  // Spread orderContent to top level
                // Map cookies array to individual cookie fields
                ...(order.orderContent?.cookies?.reduce((acc, cookie) => {
                    const fieldName = cookie.variety.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
                    acc[fieldName] = cookie.boxes;
                    return acc;
                }, {}) || {})
            };

            setupRowFields(tr, false, allOrderFields, orderData, null);
            ordersTbody.appendChild(tr);
        });
    }
}

function addFileRow(fileUrl, data, downloadAction, deleteAction) {
    const tbody = document.getElementById("your-documents-tbody");
    let tr = document.createElement("tr");
    tr.setAttribute('data-url', fileUrl);
    tr.className = "bg-white dark:bg-black even:bg-gray even:dark:bg-black-light text-sm text-black dark:text-white [&_td]:p-4";

    // Button configurations
    let buttons = [
        { title: "Download", iconClass: "fa-cloud-arrow-down text-blue hover:text-blue-light", action: downloadAction },
        { title: "Delete", iconClass: "fa-trash-can text-red hover:text-red-light", action: deleteAction }
    ];

    setupRowFields(tr, false, tableSchemas.files.fields, data, buttons);
    tbody.appendChild(tr);
}

function addRewardRow(rewardId, data, editAction, deleteAction) {
    const tbody = document.getElementById("troop-rewards-tbody");
    let tr = document.createElement("tr");
    tr.setAttribute('data-rid', rewardId);
    tr.className = "bg-white dark:bg-black even:bg-gray even:dark:bg-black-light text-sm text-black dark:text-white [&_td]:p-4";

    // Button configurations
    let buttons = [
        { title: "Edit", iconClass: "fa-pen-to-square text-blue hover:text-blue-light", action: editAction },
        { title: "Delete", iconClass: "fa-trash-can text-red hover:text-red-light", action: deleteAction }
    ];

    setupRowFields(tr, false, tableSchemas.rewards.fields, data, buttons);
    tbody.appendChild(tr);
}

function editRowData(row, fields, data) {
    if (!row || !fields || !data || typeof data !== "object") {
        console.error("Invalid parameters passed to updateTableRow");
        return;
    }

    if (fields && fields === "orders") {
        // Get cookie fields from sessionStorage
        const troopInventoryData = JSON.parse(sessionStorage.getItem('troopInventoryData'));
        const { headers: cookieHeaders, fields: cookieFields } = buildDynamicOrderFields(troopInventoryData?.inventory || []);

        // Combine all headers for orders table
        fields = [
            ...tableSchemas.orders.staticFields,
            ...cookieFields,
            ...tableSchemas.orders.footerFields
        ];
    }

    const tds = row.getElementsByTagName("td");
    let tdIndex = 0; // Keep track of which <td> to update

    fields.forEach(field => {
        if (tdIndex >= tds.length) return; // Prevent out-of-bounds errors

        if (field === "downloadUrl") {
            tds[tdIndex].children[0].src = data[field];
            tdIndex++;
        } else {
            // If field exists in orderContent, get it from orderContent; otherwise, get it from the main object
            const value = data.orderContent?.[field] ?? data[field] ?? null;
            if (value !== null) tds[tdIndex].textContent = value;
            tdIndex++;
        }
    });
}

function updateRowActions(row, actions) {
    const tds = row.getElementsByTagName("td");

    //We only want to change the last td which is the action column
    const actionTd = tds[tds.length - 1];
    actionTd.innerHTML = ""; // Clear existing actions

    actions.forEach(btn => {
        let button = document.createElement("button");
        button.className = "mr-4";
        button.title = btn.title;

        let icon = document.createElement("i");
        icon.className = `fa-solid ${btn.iconClass} text-xl`;

        button.addEventListener('click', (e) => {
            handleTableRow.currentRowEditing = e.target.closest('tr');
            btn.action();
        });

        button.appendChild(icon);
        actionTd.appendChild(button);
    });
}
//#endregion TABLE ROWS ---------------------------------------------

export { handleTableCreation, searchTableRows, handleTableRow };