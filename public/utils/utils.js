import { handleTableCreation, searchTableRows, handleTableRow } from "./tables.js";

//#region REGEX TESTS -----------------------------------------------
const expressions = {
    name: new RegExp(/^[a-zA-Z]+(?:[-'][a-zA-Z]+)?$/),
    fullName: new RegExp(/^[a-zA-Z]+(?:[-'][a-zA-Z]+)?(?:\s[a-zA-Z]+(?:[-'][a-zA-Z]+)?)?$/),
    email: new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/),
    phone: new RegExp(/^\(\d{3}\) \d{3}-\d{4}$/),
    password: new RegExp(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/)
}

const regExpCalls = {
    testName: function (name) {
        return expressions.name.test(name);
    },
    testFullName: function (fullName) {
        return expressions.fullName.test(fullName);
    },
    testEmail: function (email) {
        return expressions.email.test(email);
    },
    testPhone: function (phone) {
        return expressions.phone.test(phone);
    },
    testPassword: function (password) {
        return expressions.password.test(password);
    }
}
//#endregion --------------------------------------------------------

//#region PHONE NUMBER INPUT ----------------------------------------
function setupPhoneInput(inputElem) {
    inputElem.addEventListener('keydown', disallowNonNumericInput);
    inputElem.addEventListener('keyup', formatToPhone);

    function disallowNonNumericInput(e) {
        if (e.ctrlKey) { return; }
        if (e.key.length > 1) { return; }
        if (/[0-9.]/.test(e.key)) { return; }
        e.preventDefault();
    }

    function formatToPhone(e) {
        const digits = e.target.value.replace(/\D/g, '').substring(0, 10);
        const areaCode = digits.substring(0, 3);
        const prefix = digits.substring(3, 6);
        const suffix = digits.substring(6, 10);

        if (digits.length > 6) { e.target.value = `(${areaCode}) ${prefix}-${suffix}`; }
        else if (digits.length > 3) { e.target.value = `(${areaCode}) ${prefix}`; }
        else if (digits.length > 0) { e.target.value = `(${areaCode}`; }
    }
}
//#endregion --------------------------------------------------------

//#region CURRENCY INPUT ----------------------------------------
function setupCurrencyInput(inputElem) {
    inputElem.addEventListener('keydown', disallowNonNumericInput);
    inputElem.addEventListener('input', formatToCurrency);
    inputElem.addEventListener('blur', handleBlur);
    inputElem.addEventListener('focus', handleFocus);

    function disallowNonNumericInput(e) {
        // Allow: backspace, delete, tab, escape, enter, decimal point
        if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode >= 35 && e.keyCode <= 39) || // Allow: home, end, left, right
            ((e.keyCode >= 96 && e.keyCode <= 105)) || // Allow: numpad 0-9
            (e.keyCode >= 48 && e.keyCode <= 57)) { // Allow: 0-9
            // Let it happen
            return;
        }
        // Prevent everything else
        e.preventDefault();
    }

    function formatToCurrency(e) {
        let value = e.target.value.replace(/[^\d.]/g, ''); // Remove non-digits/decimal
        let parts = value.split('.');
        
        // Handle decimal places
        if (parts.length > 2) {
            parts = [parts[0], parts.slice(1).join('')];
        }
        if (parts[1]) {
            parts[1] = parts[1].slice(0, 2); // Max 2 decimal places
        }
        
        // Add commas for thousands
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        // Combine parts and add dollar sign
        value = '$' + parts.join('.');
        if(value === "$NaN") value = "$0.00";
        e.target.value = value;
    }

    function handleBlur(e) {
        let value = e.target.value.replace(/[^\d.]/g, '');
        if (value) {
            if(value === ".") value = 0;
            // Ensure proper decimal format on blur
            e.target.value = parseFloat(value).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            });
        }
    }

    function handleFocus(e) {
        // On focus, move cursor to end and select all
        e.target.setSelectionRange(0, e.target.value.length);
    }
}
//#endregion --------------------------------------------------------

//#region DROPDOWNS -------------------------------------------------
function setupDropdown(buttonId, dropdownId) {
    let button = document.getElementById(buttonId);
    let dropdown = document.getElementById(dropdownId);

    button.addEventListener('click', (e) => {
        e.stopPropagation();

        // Close all other dropdowns
        document.querySelectorAll('ul[id*="dropdown"]').forEach(otherDropdown => {
            if (otherDropdown !== dropdown) {
                otherDropdown.classList.add('hidden');
                otherDropdown.classList.remove('block');
            }
        });

        dropdown.classList.toggle('block');
        dropdown.classList.toggle('hidden');
    });

    dropdown.querySelectorAll("li").forEach(option => {
        option.addEventListener("click", () => {
            button.textContent = option.textContent;
            button.value = option.getAttribute("data-value");
            button.click();
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!button.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
            dropdown.classList.remove('block');
        }
    });
}

function addOptionToDropdown(dropdownId, optionText, optionValue) {
    const dropdown = document.getElementById(dropdownId);
    let li = document.createElement('li');
    li.className = "py-2.5 px-5 hover:bg-green text-black dark:text-white text-sm cursor-pointer";
    li.textContent = optionText;
    li.setAttribute("data-value", optionValue); 
    dropdown.appendChild(li);
}
//#endregion --------------------------------------------------------

//#region LOCAL STORAGE FILES ---------------------------------------
const imageStorageHandler = {
    compress: (file, maxWidth, maxHeight, quality) => compressImageFile(file, maxWidth, maxHeight, quality),
    saveFile: function (key, file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = () => {
            localStorage.setItem(key, reader.result);
        }
    },
    loadFile: function (key, imgElement) {
        const dataUrl = localStorage.getItem(key);
        if (dataUrl) {
            imgElement.src = dataUrl;
        }
    }
}

function compressImageFile(file, maxWidth = 160, maxHeight = 160, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        // Preserve the original file type
        const fileType = file.type || 'image/png';

        // Convert the file into a data URL
        reader.onload = function (event) {
            img.src = event.target.result;
        };

        reader.onerror = function (error) {
            reject(error);
        };

        reader.readAsDataURL(file);

        img.onload = function () {
            // Create a canvas to resize and compress the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // If the image is already smaller than max dimensions, return it as-is
            if (img.width <= maxWidth && img.height <= maxHeight) {
                resolve(file);
                return;
            }

            // Resize while maintaining aspect ratio
            const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
            const width = Math.round(img.width * ratio);
            const height = Math.round(img.height * ratio);

            canvas.width = width;
            canvas.height = height;

            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0, width, height);

            // Convert canvas to compressed image
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Compression failed"));
                    return;
                }
                // Compare file sizes
                if (blob.size >= file.size) {
                    resolve(file); // Return original if compression made it larger
                    return;
                }
                const compressedFile = new File([blob], file.name, {
                    type: fileType,
                    lastModified: Date.now(),
                });
                resolve(compressedFile); // Resolve with the compressed file
            }, fileType, quality); // 'quality' is the image quality (0 to 1)
        };
    });
}
//#endregion --------------------------------------------------------

export {
    regExpCalls,
    setupPhoneInput,
    setupCurrencyInput,
    setupDropdown,
    addOptionToDropdown,
    imageStorageHandler,
    handleTableCreation,
    searchTableRows,
    handleTableRow
}