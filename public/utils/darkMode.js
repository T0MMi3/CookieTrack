//Check for dark mode in localStorage
document.documentElement.classList.toggle(
    "dark",
    localStorage.getItem("theme") === "dark" ||
    (!(localStorage.getItem("theme")) && window.matchMedia("(prefers-color-scheme: dark)").matches),
);

//Update and handle toggle for login pages dark mode toggle
document.addEventListener("DOMContentLoaded", () => {
    let loginDarkMode = document.getElementById("login-dark-mode");

    if (loginDarkMode) {
        //Load the toggle states for settings
        if (localStorage.getItem("theme") === "dark" || (!(localStorage.getItem("theme")) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
            loginDarkMode.checked = true;
        } else {
            loginDarkMode.checked = false;
        }

        loginDarkMode.addEventListener('change', () => {
            if (loginDarkMode.checked) {
                localStorage.setItem("theme", "dark");
                document.documentElement.classList.add("dark");
            } else {
                localStorage.setItem("theme", "light");
                document.documentElement.classList.remove("dark");
            }
        });
    }
});
