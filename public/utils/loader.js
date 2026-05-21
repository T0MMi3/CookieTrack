export function manageLoader(shouldShow = false) {
    // Check if loader exists, if not, create it
    let loader = document.getElementById("loader");
    if (!loader) {
        const loaderHTML = `
            <div id="loader" style="display: none;">
                <div class="flex-col gap-4 w-full flex items-center justify-center fixed top-0 bottom-0 bg-loading-overlay z-[999999]">
                    <div
                        class="w-20 h-20 border-4 border-transparent text-green text-4xl animate-spin flex items-center justify-center border-t-green rounded-full"
                    >
                        <div
                            class="w-16 h-16 border-4 border-transparent text-orange text-2xl animate-spin flex items-center justify-center border-t-orange rounded-full"
                        ></div>
                    </div>
                </div>
            </div>
        `;
        loader = document.createElement("div");
        loader.innerHTML = loaderHTML.trim();
        document.body.appendChild(loader.firstChild);
        loader = document.getElementById("loader");
    }

    // Perform the requested action
    if (shouldShow === true) {
        loader.style.display = "flex";
    } else {
        loader.style.display = "none";
    }
};