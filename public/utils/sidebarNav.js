document.addEventListener('DOMContentLoaded', () => {
    createSidebar();

    // Select all parent menu items with submenus
    document.querySelectorAll('#sidebar ul > li > div').forEach((menu) => {
        menu.addEventListener('click', () => {
            const subMenu = menu.nextElementSibling;
            if (!subMenu) return;
            const arrowIcon = menu.querySelector('.fa-angle-down');

            // Check if the submenu is currently open
            if (subMenu.classList.contains('max-h-0')) {
                subMenu.classList.remove('max-h-0');
                subMenu.classList.add('max-h-[500px]');
            } else {
                subMenu.classList.remove('max-h-[500px]');
                subMenu.classList.add('max-h-0');
            }

            // Toggle arrow rotation
            arrowIcon.classList.toggle('rotate-0');
            arrowIcon.classList.toggle('-rotate-90');
        });
    });

    let sidebarCloseBtn = document.getElementById('close-sidebar');
    let sidebarOpenBtn = document.getElementById('open-sidebar');
    let sidebarCollapseMenu = document.getElementById('sidebar-collapse-menu');
    let sidebar = document.getElementById('sidebar');
    let shrunkSidebar = document.getElementById('shrunk-sidebar');

    sidebarOpenBtn?.addEventListener('click', () => {
        sidebarCollapseMenu.style.cssText = 'width: 270px; visibility: visible; opacity: 1;';
        sidebar.style.cssText = 'width: 270px;';
        shrunkSidebar.style.cssText = 'width: 0px';

        //Set a flag that the user has it open so that on new page loads it stays open on desktops.
        sessionStorage.setItem('sidebarStatus', 'open');
    });

    sidebarCloseBtn?.addEventListener('click', () => {
        sidebarCollapseMenu.style.cssText = 'width: 32px; visibility: hidden; opacity: 0;';
        sidebar.style.cssText = 'width: 32px;';
        shrunkSidebar.style.cssText = 'width: 16px';

        //Set a flag that the user has it shrunk so that on new page loads it stays shrunk on desktops.
        sessionStorage.setItem('sidebarStatus', 'closed');
    });

    //Check if user has flag set for sidebar if they are on desktop
    if (window.innerWidth >= 1024) {
        const flag = sessionStorage.getItem('sidebarStatus');
        if (flag && flag === "open") {
            sidebarOpenBtn?.click();
        } else if (flag && flag === "closed") {
            sidebarCloseBtn?.click();
        }
    }
});

function createSidebar() {
    const mainContent = document.getElementsByClassName("main-content")[0];

    const page = (link, title, icon, isSmall = false) => {
        const pageClass = isSmall ? "text-sm block py-2" : "text-lg flex items-center py-2.5";
        return `
        <li>
            <a href="../${link}" title="${title}"
                class="text-black cursor-pointer hover:bg-green-light rounded-default px-3 transition-all duration-300 ${pageClass}">
                <i class="fa-solid fa-${icon}"></i>
                <span class="overflow-hidden text-ellipsis whitespace-nowrap">
                    ${title}
                </span>
            </a>
        </li>
        `;
    }

    const mainSidebar = `
        <nav id="sidebar" class="lg:w-[270px] max-lg:fixed transition-all duration-500 shrink-0 z-[101]">
            <div id="sidebar-collapse-menu" class="bg-green shadow-default h-screen fixed top-0 left-0 overflow-auto overflow-x-hidden z-[99] lg:w-[270px] max-lg:w-0 max-lg:invisible transition-all duration-500">
                <div class="bg-white dark:bg-black flex items-center gap-4 pt-6 pb-2 px-4 sticky top-0 min-h-[64px] z-[100]">
                    <a href="../dashboard/dashboard.html" title="CookieTrack Logo">
                        <img src="../resources/images/cookietrack_logo.png" alt="logo" class="w-40 max-lg:mr-5 accent-green" />
                    </a>
                    <button id="close-sidebar" title="Close Sidebar" class="ml-auto hover:bg-off-white hover:dark:bg-black-light p-2 rounded-default transition-all duration-300">
                        <i class="fa-solid fa-bars-staggered text-xl text-black dark:text-white"></i>
                    </button>
                </div>
                <div class="py-4 px-4">
                    <ul class="space-y-2">
                    ${page("dashboard/dashboard.html", "Dashboard", "house")}
                    ${page("inventory/inventory.html", "Inventory", "boxes-stacked")}
                    ${page("orders/orders.html", "Orders", "money-check-dollar")}
                        <li>
                            <div title="Show/Hide Manage Pages" class="text-black text-lg flex items-center cursor-pointer hover:bg-green-light rounded-default px-3 py-2.5 transition-all duration-300">
                                <i class="fa-solid fa-list-check"></i>
                                <span class="overflow-hidden text-ellipsis whitespace-nowrap">Manage</span>
                                <i class="fa-solid fa-angle-down w-2.5 h-2.5 text-sm rotate-0 ml-auto transition-all duration-500"></i>
                            </div>
                            <ul class="sub-menu overflow-hidden transition-[max-height] duration-500 ease-in-out ml-8">
                                ${page("troop/troopers.html", "Troopers", "users", true)}
                                ${page("troop/rewards.html", "Rewards", "gifts", true)}
                            </ul>
                        </li>
                    </ul>
                    <div class="absolute bottom-6 w-[238px]">
                        <hr class="border-black my-6" />
                        <ul class="space-y-2">
                            <li>
                                <button id="nav-signout" title="Sign Out" class="w-full gap-1 text-black text-lg flex items-center cursor-pointer hover:bg-green-light rounded-default px-3 py-2.5 transition-all duration-300">
                                    <i class="fa-solid fa-right-from-bracket -ml-1"></i>
                                    Sign Out
                                </button>
                            </li>
                        </ul>
                        <a href="../user/account.html" title="User Account" class="need-skeleton mt-2 flex items-center cursor-pointer hover:bg-green-light rounded-default px-3 py-2.5 transition-all duration-300">
                            <img id="nav-userphoto" src="../resources/images/avatar.png" alt="Profile picture" class="w-9 h-9 rounded-full border-2 border-black shrink-0" />
                            <div class="ml-4">
                                <p id="nav-username" class="text-sm text-black whitespace-nowrap"></p>
                                <p id="nav-useremail" class="text-xs text-black whitespace-nowrap"></p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </nav>    
    `;

    const shrunkPage = (link, title, icon, isSmall = false) => {
        const pageClass = isSmall ? "text-sm block py-2" : "text-lg flex items-center p-[13px]";
        return `
        <li>
            <a href="../${link}" title="${title}"
                class="text-black cursor-pointer hover:bg-green-light rounded-default px-3 transition-all duration-300 ${pageClass}">
                <i class="fa-solid fa-${icon}"></i>
                ${isSmall ? title : ""}
            </a>
        </li>
        `;
    }

    const shrunkSidebar = `
        <nav id="shrunk-sidebar" class="max-lg:fixed max-lg:hidden transition-all duration-500 shrink-0 z-[100]">
            <div class="bg-green shadow-default h-screen fixed top-0 left-0 overflow-auto overflow-x-hidden z-[99] w-12 max-lg:w-0 max-lg:invisible transition-all duration-500">
                <div class="bg-white dark:bg-black flex items-center p-2 sticky top-0 min-h-[64px] z-[100]"></div>
                <div class="py-4 px-[2px]">
                    <ul class="space-y-2">
                        ${shrunkPage("dashboard/dashboard.html", "Dashboard", "house")}
                        ${shrunkPage("inventory/inventory.html", "Inventory", "boxes-stacked")}
                        ${shrunkPage("orders/orders.html", "Orders", "money-check-dollar")}
                        <li class="group">
                            <div class="text-black text-lg flex items-center cursor-pointer hover:bg-green-light rounded-default p-[13px] transition-all duration-300">
                                <i class="fa-solid fa-list-check"></i>
                            </div>
                            <ul class="group-hover:pointer-events-auto group-hover:opacity-100 overflow-hidden transition-opacity duration-200 ease-in-out fixed opacity-0 pointer-events-none top-[235px] left-[45px] p-[2px] rounded-default bg-white shadow-default">
                                ${shrunkPage("troop/troopers.html", "Troopers", "users", true)}
                                ${shrunkPage("troop/rewards.html", "Rewards", "gifts", true)} 
                            </ul>
                        </li>
                    </ul>
                    <div class="absolute bottom-6 w-[44px]">
                        <hr class="border-black my-6" />
                        <ul class="space-y-2">
                            <li>
                                <button id="nav-sm-signout" title="Sign Out" class="w-full gap-1 text-black text-lg flex items-center cursor-pointer hover:bg-green-light rounded-default px-3 py-2.5 transition-all duration-300">
                                    <i class="fa-solid fa-right-from-bracket"></i>
                                </button>
                            </li>
                        </ul>
                        <a href="../user/account.html" title="User Account" class="need-skeleton mt-2 py-1 flex items-center justify-center cursor-pointer hover:bg-green-light rounded-default transition-all duration-300">
                            <img id="nav-sm-userphoto" src="../resources/images/avatar.png" alt="Profile picture" class="w-9 h-9 rounded-full border-2 border-black shrink-0" />
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    `;

    const openSidebar = `
        <button id="open-sidebar" title="Open Sidebar" class="max-lg:-left-[5px] max-lg:pr-[4px] max-lg:bg-white max-lg:dark:bg-black max-lg:shadow-default ml-auto fixed top-[20px] left-[7px] z-[100] hover:bg-off-white hover:dark:bg-black-light p-2 rounded-default transition-all duration-300">
            <i class="fa-solid fa-bars-staggered max-lg:text-lg text-xl text-black dark:text-white"></i>
        </button>
    `;

    mainContent.insertAdjacentHTML("beforebegin", mainSidebar);
    mainContent.insertAdjacentHTML("beforebegin", shrunkSidebar);
    mainContent.insertAdjacentHTML("beforebegin", openSidebar);
}