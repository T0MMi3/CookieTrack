import { callApi } from "../utils/apiCall.js";
import { handleSkeletons } from "../utils/skeletons.js";
import { handleTableCreation } from "../utils/tables.js";
import { auth } from "../utils/auth.js";

//#region CREATE TABLES/LOAD DATA -----------------------------------
let userData;
let welcome = document.getElementById("welcome-greeting");
let welcomeParent = welcome.parentElement;

//First show skeleton loaders as dashboard info is waiting to be pulled
const mainContent = document.getElementsByClassName('main-content')[0];
handleSkeletons.hideNeedSkeletons(welcomeParent.parentElement);
handleSkeletons.greetingSkeleton(welcomeParent.parentElement);
handleSkeletons.monthlySkeleton(mainContent);
handleSkeletons.statsSkeleton(mainContent, 2);

//Wait for auth setup then pull user info and dashboard
document.addEventListener("authStateReady", async () => {
    userData = JSON.parse(sessionStorage.getItem("userData"));

    //Create monthly cookie and stats, load user info
    if (userData.id) {
        const [fName, lName] = userData.name ? userData.name.split(" ") : ["", ""];
        welcome.textContent = `Welcome back, ${fName}`;

        //Get the sales data and the troop inventory, and parent inventory
        const troopSalesData = await callApi('/saleDatas');
        const troopInventoryData = await callApi('/leaderInventory');
        const parentInventoryData = await callApi(`/inventory/${userData.id}`);

        handleTableCreation.monthlyCookie(mainContent, getCurrentMonthCookie());

        loadSaleDataBoxes(troopSalesData, troopInventoryData.inventory, "Troop");
        loadSaleDataBoxes(troopSalesData, parentInventoryData[0].inventory, "Your");
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

function loadSaleDataBoxes(saleData, inventory, saleDataType) {
    //Get the revenue and boxes sold for the current month
    //If saleDataType is Troop, get the completed order count for the month
    //If saleDataType is Your, get the current owe amount for the parent
    let revenue = 0, boxesSold = 0, completedOrders = 0, currentInventory = 0;
    let oweAmount = (inventory && inventory.owe) || 0;

    if (saleData) {
        saleData.forEach((data) => {
            if (saleDataType === "Troop" || data.ownerId === userData.id) {
                data.orderInfo.forEach((order) => {
                    if (order.dateCompleted) {
                        const date = new Date(order.dateCompleted);
                        if (date.getMonth() === new Date().getMonth()) {
                            revenue += order.totalCost;
                            boxesSold += order.boxTotal;
                            completedOrders++;
                        }
                    }
                });
            }
        });
    }

    if (inventory) {
        inventory.forEach((cookie) => {
            currentInventory += cookie.boxes;
        });
    }

    //Create the statData object based on saleDataType
    const statData = {
        id: saleDataType,
        stats: [
            {
                title: "Revenue this Month",
                stat: `${revenue.toLocaleString("en-US", { style: "currency", currency: "USD" })}`
            },
            {
                title: "Boxes Sold this Month",
                stat: `${boxesSold} boxes`
            },
            {
                title: "Current Inventory",
                stat: `${currentInventory} boxes`
            },
            ...(saleDataType === "Troop" ? [
                {
                    title: "Orders Completed this Month",
                    stat: `${completedOrders} orders`
                }
            ] : [
                {
                    title: "Amount Owed",
                    stat: `${oweAmount.toLocaleString("en-US", { style: "currency", currency: "USD" })}`
                }
            ])
        ]
    }

    handleTableCreation.statBox(mainContent, statData);
}

function getCurrentMonthCookie() {
    const monthlyCookie = {
            0: { name: "Adventurefuls", image: "../resources/images/adventurefuls.jpg" },
            1: { name: "Thin Mints", image: "../resources/images/thin-mints.jpg" },
            2: { name: "Peanut Butter Patties", image: "../resources/images/pb-patties.png" },
            3: { name: "Trefoils", image: "../resources/images/trefoils.jpg" },
            4: { name: "Samoas", image: "../resources/images/samoas.jpg" },
            5: { name: "Tagalongs", image: "../resources/images/tagalongs.jpg" },
            6: { name: "Do-si-dos", image: "../resources/images/do-si-dos.jpg" },
            7: { name: "Toffee-tastic", image: "../resources/images/toffee-tastic.jpg" },
            8: { name: "Thin Mints", image: "../resources/images/thin-mints.jpg" },
            9: { name: "Samoas", image: "../resources/images/samoas.jpg" },
            10: { name: "Tagalongs", image: "../resources/images/tagalongs.jpg" },
            11: { name: "Adventurefuls", image: "../resources/images/adventurefuls.jpg" },
    };

    const currentMonth = new Date().getMonth();
    return monthlyCookie[currentMonth] || { name: "Unknown", image: "../resources/images/cookie_icon.png" };
}
//#endregion CREATE TABLES/LOAD DATA --------------------------------