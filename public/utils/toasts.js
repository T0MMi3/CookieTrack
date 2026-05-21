export const STATUS_COLOR = { RED: "#d53d3d", GREEN: "#1a9988" };

export function showToast(title, message, statusColor, isTimed, seconds) {
    // Check if toast-holder exists, if not, create it
    let toastHolder = document.getElementById('toast-holder');
    if (!toastHolder) {
        toastHolder = document.createElement('div');
        toastHolder.id = 'toast-holder';
        document.body.appendChild(toastHolder);
    }

    // Create the toast element programmatically
    const toastElem = document.createElement('div');
    toastElem.className = 'toast';
    toastElem.style.setProperty('--toast-status', statusColor);

    const toastContent = document.createElement('div');
    toastContent.className = 'toast-content';

    const toastIcon = document.createElement('i');
    toastIcon.className = 'fa-solid fa-bell bell';

    const toastMessage = document.createElement('div');
    toastMessage.className = 'toast-message';

    const toastTitle = document.createElement('span');
    toastTitle.className = 'toast-title';
    toastTitle.textContent = title;

    const toastText = document.createElement('span');
    toastText.textContent = message;

    const toastClose = document.createElement('i');
    toastClose.className = 'fa-solid fa-xmark close';

    const toastProgress = document.createElement('div');
    toastProgress.className = 'toast-progress';

    // Append elements
    toastMessage.appendChild(toastTitle);
    toastMessage.appendChild(toastText);
    toastContent.appendChild(toastIcon);
    toastContent.appendChild(toastMessage);
    toastElem.appendChild(toastContent);
    toastElem.appendChild(toastClose);
    toastElem.appendChild(toastProgress);

    // Add the new toast into the toast holder
    toastHolder.insertBefore(toastElem, toastHolder.firstChild);

    // Show the toast
    setTimeout(() => {
        toastElem.classList.add('active');
    }, 100);

    // Handle progress bar if isTimed is true
    if (isTimed === true) {
        toastProgress.style.setProperty('--toast-duration', seconds + 's');
        toastProgress.classList.add('active');

        toastProgress.addEventListener("animationend", function () {
            toastElem.classList.remove('active');
            toastProgress.classList.remove('active');
            setTimeout(() => {
                toastElem.remove();
            }, 500);
        });
    }

    // Limit the number of toasts: 2 for mobile, 4 for desktop
    const currToastArr = Array.from(toastHolder.children);
    const maxToasts = window.innerWidth <= 600 ? 2 : 4;
    if (currToastArr.length > maxToasts) {
        for (let i = maxToasts; i < currToastArr.length; i++) {
            currToastArr[i].querySelector('.close').click();
        }
    }

    // Close toast on click of the close button
    toastClose.addEventListener('click', function () {
        toastProgress.classList.remove('active');
        toastElem.classList.remove('active');
        setTimeout(() => {
            toastElem.remove();
        }, 500);
    });
};