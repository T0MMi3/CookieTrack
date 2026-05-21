const handleSkeletons = {
    hideNeedSkeletons: (parent) => hideNeedSkeletonElems(parent),
    removeSkeletons: (parent) => removeSkeletonElems(parent),
    sidebarSkeleton: (parent, isShrunkSidebar) => createSidebarUserSkeleton(parent, isShrunkSidebar),
    greetingSkeleton: (parent) => createGreetingSkeleton(parent),
    monthlySkeleton: (parent) => createMonthlyCookieSkeleton(parent),
    statsSkeleton: (parent, amount) => createStatsSkeleton(parent, amount),
    tableSkeleton: (parent, amount) => createTableSkeleton(parent, amount),
    rewardSkeleton: (parent, amount) => createRewardSkeleton(parent, amount),
}

function hideNeedSkeletonElems(parent) {
    const elems = parent.getElementsByClassName('need-skeleton');

    Array.from(elems).forEach(elem => {
        elem.classList.add('hidden');
    });
}

function removeSkeletonElems(parent) {
    const skeletons = parent.getElementsByClassName('skeleton');
    const needSkeletons = parent.getElementsByClassName('need-skeleton');

    Array.from(skeletons).forEach(elem => {
        elem.remove();
    });

    Array.from(needSkeletons).forEach(elem => {
        elem.classList.remove('hidden');
    });
}

function createSidebarUserSkeleton(parent, isShrunkSidebar) {
    const userInfo = `
    <div class="ml-4">
        <div class="animate-pulse bg-gray w-32 h-4 rounded-default mb-2"></div>
        <div class="animate-pulse bg-gray w-40 h-4 rounded-default"></div>
    </div>
    `;

    const isShrunkClass = isShrunkSidebar ? 'justify-center py-1' : 'px-3 py-2.5';
    const skeleton = document.createElement('div');
    skeleton.className = `skeleton mt-2 flex items-center rounded-default ${isShrunkClass}`;
    skeleton.innerHTML = `
    <div class="animate-pulse bg-gray w-9 h-9 rounded-full shrink-0"></div>
    ${isShrunkSidebar ? "" : userInfo}
    `;
    parent.appendChild(skeleton);
}

function createGreetingSkeleton(parent) {
    const skeleton = document.createElement('div');
    skeleton.className = "skeleton";
    skeleton.innerHTML = `
    <div class="animate-pulse bg-gray w-48 h-7 rounded-default mb-2"></div>
    <div class="animate-pulse bg-gray w-64 h-7 rounded-default"></div>
    `;

    parent.appendChild(skeleton);
}

function createMonthlyCookieSkeleton(parent) {
    const skeleton = document.createElement('div');
    skeleton.className = "skeleton bg-green relative max-w-[120rem] shadow-default mx-auto rounded-default overflow-hidden mt-8 mb-8";
    skeleton.innerHTML = `
    <div class="grid sm:grid-cols-2 max-sm:gap-6">
        <div class="p-6 flex flex-col justify-center items-center w-full">
            <div class="animate-pulse bg-gray w-full h-16 rounded-default"></div>
            <div class="animate-pulse bg-gray w-full h-7 rounded-default mt-4"></div>
            <div class="animate-pulse bg-gray w-4/5 h-9 rounded-default mt-4"></div>
        </div>

        <div class="flex justify-end max-sm:justify-center items-center p-2 bg-gradient-to-b from-orange to-orange-light rounded-bl-[230px] max-sm:rounded-bl-none w-full h-full">
            <div class="w-[calc(70vw_-_1.5rem)] h-[calc(70vw_-_1.5rem)] max-w-72 max-h-72 rounded-full bg-gradient-to-tr from-orange to-orange-light p-5">
                <div class="animate-pulse bg-gray w-full h-full rounded-full object-contain border-8 border-gray"></div>
            </div>
        </div>
    </div>

    <div class="absolute -top-[50px] -left-[50px] w-28 h-28 rounded-full bg-orange opacity-40 shadow-lg">
    </div>
    <div class="absolute -top-10 -left-10 w-28 h-28 rounded-full bg-orange opacity-40 shadow-lg">
    </div>
    `;

    parent.appendChild(skeleton);
}

function createStatsSkeleton(parent, amount) {
    const box = `
    <div class="bg-white dark:bg-black rounded-default border border-gray shadow-default px-7 py-8">
        <div class="animate-pulse bg-gray w-full h-7 mb-1 rounded-default"></div>
        <div class="animate-pulse bg-gray w-full h-12 rounded-default"></div>             
    </div>
    `;

    for (let i = 0; i < amount; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton bg-white dark:bg-black px-4 py-12 rounded-default shadow-default max-w-[120rem] m-auto mb-8';
        skeleton.innerHTML = `
        <div class="max-sm:max-w-sm mx-auto">
            <div class="animate-pulse bg-gray w-96 h-10 mb-8 max-sm:max-w-52 max-sm:w-auto max-sm:h-8 rounded-default"></div>
            <div class="grid md:grid-cols-4 sm:grid-cols-2 gap-5">
                ${box}${box}${box}${box}
            </div>
        </div>
        `;
        parent.appendChild(skeleton);
    }
}

function createTableSkeleton(parent, amount) {
    const th = `<th class="after:bg-white after:w-full after:min-w-40 after:h-8 after:block after:rounded-default"></th>`;
    const td = `<td class="after:bg-gray after:w-full after:min-w-40 after:h-8 after:block after:rounded-default"></td>`;
    const bodyTr = `<tr class="[&_td]:p-4 [&_td]:animate-pulse">${td}${td}${td}${td}</tr>`;

    for (let i = 0; i < amount; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton bg-white dark:bg-black py-6 px-4 max-w-[120rem] relative shadow-default mx-auto mt-8 mb-8 rounded-default';
        skeleton.innerHTML = `
        <div class="animate-pulse bg-gray mb-8 rounded-default w-80 h-12 max-sm:max-w-52 max-sm:w-auto max-sm:h-8"></div>
        <div class="overflow-x-auto pb-4">
            <table class="animate-pulse min-w-full border-separate border-spacing-0 border-4 border-gray rounded-default">
                <thead class="animate-pulse bg-gray whitespace-nowrap">
                    <tr class="[&_th]:p-4 [&_th]:animate-pulse">
                        ${th}${th}${th}${th}
                    </tr>
                </thead>
                <tbody class="whitespace-nowrap">
                    ${bodyTr}${bodyTr}${bodyTr}
                </tbody>
            </table>
        <div>
        `;
        parent.appendChild(skeleton);
    }
}

function createRewardSkeleton(parent, amount) {
    const statBox = `
    <div>
        <div class="animate-pulse bg-gray mb-2 rounded-default w-full h-7"></div>
        <div class="bg-white dark:bg-black p-6 rounded-default shadow-default">
            <div class="flex flex-col justify-center items-center h-full pb-4">
                <div class="animate-pulse bg-gray mb-2 rounded-default w-full h-20"></div>
                <div class="animate-pulse bg-gray rounded-default w-full h-5"></div>
            </div>
        </div>
    </div>
    `;

    const rewardBox = `
    <div class="bg-white dark:bg-black rounded-default shadow-default w-full overflow-hidden mx-auto">
        <div class="animate-pulse bg-gray min-h-24 h-44 w-full"></div>
        <div class="p-4">
            <div class="animate-pulse bg-gray rounded-default w-full h-6"></div>
            <div class="animate-pulse bg-gray mt-2 rounded-default w-full h-7"></div>
            <div class="animate-pulse bg-gray mt-2 rounded-default w-full h-10"></div>
        </div>
    </div>
    `;

    for (let i = 0; i < amount; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = "skeleton mt-12 mb-6 px-2";
        skeleton.innerHTML = `
        <div class="max-w-[120rem] mx-auto bg-white dark:bg-black rounded-default shadow-default p-6">
            <div class="animate-pulse bg-gray mb-8 rounded-default w-80 h-12 max-sm:max-w-52 max-sm:w-auto max-sm:h-8"></div>
            <div class="grid md:grid-cols-2 gap-6">
                ${statBox}${statBox}
            </div>

            <div class="animate-pulse bg-gray mt-6 mb-2 rounded-default w-full h-7"></div>
            <div class="grid md:grid-cols-4 gap-4 mt-4">
                ${rewardBox}${rewardBox}${rewardBox}${rewardBox}
            </div>
        </div>
        `;
        parent.appendChild(skeleton);
    }
}

export { handleSkeletons };