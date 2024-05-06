const settingsPopup = document.querySelectorAll("#popup");
const handleSettingsPopUp = (e) => {
  settingsPopup[1].style.display = "flex";
};

const handleCreatePostPopUp = (e) => {
  settingsPopup[0].style.display = "flex";
};

settingsPopup.forEach((popup) =>
  popup.addEventListener("click", (e) => {
    if (e.target.id == "cancle" || e.target == popup) {
      popup.style.display = "none";
    } else if (e.target.textContent.toLowerCase().includes("log out")) {
      window.location.href = "/logout";
    }
  })
);

const postUpload = document.querySelector("#postUpload");
console.log(postUpload);
postUpload.addEventListener("change", (e) => {
  var files = e.target.files;

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var img = document.createElement("img");
    var reader = new FileReader();

    reader.onloadend = function () {
      img.src = reader.result;
    };

    reader.readAsDataURL(file);
    postUpload.parentNode.insertBefore(img, postUpload.nextSibling);
  }
});
