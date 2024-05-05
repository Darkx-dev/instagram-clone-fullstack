const settingsPopup = document.querySelector(".settings__popup__wrapper") 
const handleSettingsPopUp = (e) => {
    settingsPopup.style.display = "flex"
}

settingsPopup.addEventListener("click", (e) => {
    if (e.target.id == "cancle" || e.target == settingsPopup) {
        settingsPopup.style.display = "none"
    } else if (e.target.textContent = "logout") {
        window.location.href = "/logout"
    }
})
