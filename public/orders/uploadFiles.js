import { showToast, STATUS_COLOR } from "../utils/toasts.js";
import { handleTableRow } from "../utils/utils.js";
import { createModals } from "../utils/confirmModal.js";
import { manageLoader } from "../utils/loader.js";
import { callApi } from "../utils/apiCall.js";
import { storage } from "../utils/auth.js";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js';

//Wait for auth setup then pull user data
let userData;
document.addEventListener("authStateReady", async () => {
    userData = JSON.parse(sessionStorage.getItem("userData"));
}, { once: true });

//#region Add/Edit Files --------------------------------------------
let uploadFilesForm = document.getElementById('upload-files-form');
let uploadFilesInput = document.getElementById('upload-files-input');
let uploadFilesDropArea = document.getElementById('upload-files-drop-area');
let uploadFilesProgList = document.getElementById('upload-files-prog-list');
let uploadFilesCancel = document.getElementById('upload-files-cancel');
let uploadFilesSubmit = document.getElementById('upload-files-submit');
let uploadFilesClose = document.getElementById('upload-files-close');
let uploadedFiles = [];
let uploadProgress = {}; //Track progress per file
let downloadUrls = {}; //Hold urls for each file

export function openFileUploadModal() {
    uploadFilesForm.classList.remove('hidden');
    uploadFilesForm.classList.add('flex');
}

//Close/Cancel the file upload modal
uploadFilesClose.addEventListener('click', closeFileUploadModal, false);
uploadFilesCancel.addEventListener('click', closeFileUploadModal, false);

function closeFileUploadModal() {
    uploadFilesForm.classList.remove('flex');
    uploadFilesForm.classList.add('hidden');
    uploadedFiles = [];
    uploadProgress = {};
    uploadFilesInput.value = "";
    uploadFilesSubmit.disabled = true;
    uploadFilesSubmit.textContent = "Submit";
    uploadFilesCancel.classList.remove("hidden");
    uploadFilesDropArea.classList.remove('hidden');
    renderFileProgress();
}

//Submit the files and close the modal
uploadFilesSubmit.addEventListener("click", () => {
    //First remove the option to remove files
    document.querySelectorAll(".remove-file").forEach((btn) => {
        btn.remove();
    });

    if (uploadFilesSubmit.textContent === "Submit") {
        if (uploadedFiles.length > 0) {
            uploadFilesSubmit.disabled = true;
            uploadFilesDropArea.classList.add('hidden');
            uploadedFiles.forEach((file, index) => uploadFiles(file, index));
        }
    } else if (uploadFilesSubmit.textContent === "Done") {
        uploadedFiles.forEach((file, index) => {
            let fileData = {
                fileName: file.name,
                fileSize: formatFileSize(file.size),
                dateUploaded: new Date().toLocaleDateString("en-US"),
            }
            handleTableRow.yourDocuments(downloadUrls[index], fileData, downloadFile, deleteUploadedFile);
            //Update session storage with new documents
            let userFileData = {
                name: file.name,
                size: formatFileSize(file.size),
                dateUploaded: new Date().toLocaleDateString("en-US"),
                url: downloadUrls[index]
            }
            userData.documents = userData.documents || [];
            userData.documents.push(userFileData);
            sessionStorage.setItem("userData", JSON.stringify(userData));
        });
        closeFileUploadModal();
    }
});

//Prevent default drag behaviors
["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    uploadFilesDropArea.addEventListener(eventName, (e) => e.preventDefault(), false);
});

//Highlight the drop area on drag over
["dragenter", "dragover"].forEach(eventName => {
    uploadFilesDropArea.addEventListener(eventName, () => uploadFilesDropArea.classList.add("border-green"), false);
});

//Remove highlight on drag leave or drop
["dragleave", "drop"].forEach(eventName => {
    uploadFilesDropArea.addEventListener(eventName, () => uploadFilesDropArea.classList.remove("border-green"), false);
});

//Handle dropped files
uploadFilesDropArea.addEventListener("drop", (event) => {
    const droppedFiles = Array.from(event.dataTransfer.files);
    updateFileList(droppedFiles);
});

//Handle selected files
uploadFilesInput.addEventListener('change', (event) => {
    const selectedFiles = Array.from(event.target.files);
    updateFileList(selectedFiles);
});

function updateFileList(selectedFiles) {
    uploadedFiles = [...uploadedFiles, ...selectedFiles];
    uploadProgress = {};
    uploadedFiles.forEach((file, index) => (uploadProgress[index] = 0));
    renderFileProgress();
    uploadFilesSubmit.textContent = "Submit";
    uploadFilesSubmit.disabled = uploadedFiles.length === 0;
}

//Shows the uploaded files in a list with a progress tracker
function renderFileProgress() {
    uploadFilesProgList.innerHTML = "";
    uploadedFiles.forEach((file, index) => {
        const fileElem = document.createElement("div");
        fileElem.className = "flex flex-col p-4 rounded-lg";
        fileElem.innerHTML = `
            <div class="flex">
                <p class="text-xs text-black dark:text-white flex-1">
                    <i class="fa-solid fa-file-lines w-5 mr-2 inline-block text-lg"></i>
                    ${file.name} <span class="ml-2">(${formatFileSize(file.size)})</span>
                </p>
                <i data-index="${index}" class="remove-file fa-solid fa-xmark text-xl text-black hover:text-black-light dark:text-white hover:dark:text-off-white shrink-0 w-3 cursor-pointer"></i>
            </div>
            <div class="bg-black dark:bg-white rounded-full w-full h-2 my-2">
                <div id="progress-${index}" class="w-0 h-full rounded-full bg-green flex items-center relative">
                    <span class="absolute text-xs right-0 bg-white w-2 h-2 rounded-full"></span>
                </div>
            </div>
            <p id="progress-text-${index}" class="text-xs text-green flex-1">Waiting for submission</p>`;
        uploadFilesProgList.appendChild(fileElem);
    });

    //Event listeners for removing individual files
    document.querySelectorAll(".remove-file").forEach((btn) => {
        btn.addEventListener("click", (event) => {
            uploadedFiles.splice(event.target.dataset.index, 1);
            uploadProgress = {};
            uploadedFiles.forEach((file, index) => (uploadProgress[index] = 0));
            renderFileProgress();
            uploadFilesSubmit.disabled = uploadedFiles.length === 0;
        })
    });
};

export function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
}

//Upload the files directly to Firebase Storage and show progress
async function uploadFiles(file, index) {
    const progressElement = document.getElementById(`progress-${index}`);
    const progressText = document.getElementById(`progress-text-${index}`);

    try {
        // Upload directly to Firebase Storage from the browser
        const filePath = `users/${userData.id}/documents/${file.name}`;
        const storageRef = ref(storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    progressElement.style.width = progress + "%";
                    progressText.textContent = `${Math.round(progress)}% done`;
                },
                (error) => reject(error),
                () => resolve()
            );
        });

        // Get the download URL
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        // Save metadata to backend (just a URL string, no file transfer)
        await callApi(`/documentMeta/${userData.id}`, 'POST', {
            name: file.name,
            url: downloadURL,
            size: formatFileSize(file.size),
            dateUploaded: new Date().toLocaleDateString("en-US"),
        });

        //Successful upload
        uploadProgress[index] = 100;
        progressText.textContent = "Upload complete!";
        progressElement.style.width = "100%";
        checkUploadsComplete();
        downloadUrls[index] = downloadURL;
    } catch (error) {
        console.error('Error uploading file:', error);
        showToast("Error Uploading File", 'There was an error with uploading a file. Please try again.', STATUS_COLOR.RED, true, 5);
    }
};

//Makes sure all uploads are done before allowing modal closure
function checkUploadsComplete() {
    const allDone = Object.values(uploadProgress).every((val) => val === 100);
    if (allDone) {
        uploadFilesSubmit.disabled = false;
        uploadFilesSubmit.textContent = "Done";
        uploadFilesCancel.classList.add("hidden");
    }
}
//#endregion Add/Edit Files -----------------------------------------

//#region TABLE ACTIONS ---------------------------------------------
export function downloadFile() {
    const downloadUrl = handleTableRow.currentRowEditing.getAttribute('data-url');
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.click();
    link.remove();
    showToast("File Downloaded", "The selected file has been downloaded.", STATUS_COLOR.GREEN, true, 5);
}

export async function deleteUploadedFile() {
    manageLoader(true);

    try {
        const fileNameTd = handleTableRow.currentRowEditing.querySelector('td');
        const fileName = fileNameTd.textContent.trim();

        // Delete from Firebase Storage directly
        const filePath = `users/${userData.id}/documents/${fileName}`;
        const storageRef = ref(storage, filePath);
        await deleteObject(storageRef);

        // Delete metadata from backend
        await callApi(`/document/${userData.id}`, 'DELETE', { fileName });

        //Document deleted, remove the file from userData in sessionStorage and from tables and show message
        userData.documents = userData.documents.filter(doc => doc.name !== fileName);
        sessionStorage.setItem("userData", JSON.stringify(userData));
        handleTableRow.currentRowEditing.remove();
        showToast("Document Deleted", "The selected document has been deleted.", STATUS_COLOR.GREEN, true, 5);
    } catch (error) {
        console.error('Error deleting document:', error);
        showToast("Error Deleting Document", 'There was an error with deleting this document. Please try again.', STATUS_COLOR.RED, true, 5);
    }

    manageLoader(false);
}
//#endregion TABLE ACTIONS ------------------------------------------