export const createModals = {
    pickupOrder: (pickupAction) => createModal(pickupAction, modalInfo.pickupOrder),
    completeOrder: (confirmAction) => createModal(confirmAction, modalInfo.completeOrder),
    deleteItem: (deleteAction) => createModal(deleteAction, modalInfo.deleteItem)
}

const modalInfo = {
    pickupOrder: {
        title: "Pickup Order",
        message: "Are you sure you want to mark this order as picked up?",
        icon: "fa-truck",
        text: "text-green",
        background: "bg-green",
        hover: "bg-green-light",
        action: "Mark as Picked Up"
    },
    completeOrder: {
        title: "Order Completion",
        message: "Are you sure you want to complete this order?",
        icon: "fa-clipboard-check",
        text: "text-green",
        background: "bg-green",
        hover: "bg-green-light",
        action: "Complete"
    }, 
    deleteItem: {
        title: "Deletion",
        message: "Are you sure you want to delete?",
        icon: "fa-trash-can",
        text: "text-red",
        background: "bg-red",
        hover: "bg-red-light",
        action: "Delete"
    }
}

function createModal(action, info) {
    return () => {
        const modal = document.createElement('div');
        modal.id = 'confirm-modal';
        modal.className = 'flex fixed inset-0 p-4 flex-wrap justify-center items-center w-full h-full z-[1000] before:fixed before:inset-0 before:w-full before:h-full before:bg-black-overlay shadow-default overflow-auto';

        modal.innerHTML = `
        <form class="w-full max-w-xl bg-white dark:bg-black shadow-default rounded-default p-6 relative">
            <div class="flex items-center pb-3 border-b border-gray">
                <div class="flex-1">
                    <h3 id="confirm-modal-title" class="${info.text} text-xl font-bold">Confirm ${info.title}</h3>
                </div>
                <i id="confirm-modal-close" class="fa-solid fa-xmark text-xl text-black hover:text-black-light dark:text-white hover:dark:text-off-white shrink-0 ml-2 w-3 cursor-pointer"></i>
            </div>
            <div class="flex flex-col gap-4 mt-6 text-center">
                <i class="fa-solid ${info.icon} ${info.text} text-4xl"></i>
                <p class="text-base text-black dark:text-white">${info.message}</p>
            </div>
            <div class="border-t border-gray pt-6 flex justify-between gap-4 mt-6">
                <button id="confirm-modal-cancel" type="button" class="w-full px-4 py-2 rounded-default text-black dark:text-white text-sm border-none tracking-wide bg-white hover:bg-gray dark:bg-black hover:dark:bg-black-light accent-green">Cancel</button>
                <button id="confirm-modal-submit" type="button" class="w-full px-4 py-2 rounded-default text-white text-sm border-none tracking-wide ${info.background} hover:${info.hover} accent-black">${info.action}</button>
            </div>
        </form>
    `;

        document.body.appendChild(modal);

        // Event listeners for closing the modal
        document.getElementById('confirm-modal-close').addEventListener('click', () => modal.remove());
        document.getElementById('confirm-modal-cancel').addEventListener('click', () => modal.remove());
        document.getElementById('confirm-modal-submit').addEventListener('click', () => {
            action();
            modal.remove();
        });
    }
}
