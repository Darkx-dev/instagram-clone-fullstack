const settingsPopup = document.querySelectorAll("#popup") 
const handleSettingsPopUp = (e) => {
    settingsPopup[1].style.display = "flex"
}

const handleCreatePostPopUp = (e) => {
    settingsPopup[0].style.display = "flex"
}

settingsPopup.forEach(popup => popup.addEventListener("click", (e) => {
    if (e.target.id == "cancle" || e.target == popup) {
        popup.style.display = "none"
    } else if (e.target.textContent.toLowerCase().includes("log out")) {
        window.location.href = "/logout"
    } else {
        alert("Feature not available")
    }
}))