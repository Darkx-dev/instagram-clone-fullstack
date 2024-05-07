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
const imgWrapper = document.querySelector("#imgWrapper");
const delAfter = document.querySelectorAll(".delAfter");
console.log(delAfter);
postUpload.addEventListener("change", (e) => {
  var files = e.target.files;

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var img = document.createElement("img");
    img.id = "upload__preview";
    var reader = new FileReader();

    reader.onloadend = function () {
      img.src = reader.result;
    };

    reader.readAsDataURL(file);
    img.style.objectFit = "cover";
    img.style.aspectRatio = "1/1";
    imgWrapper.style.maxWidth = "100%";
    imgWrapper.appendChild(img);
  }
  delAfter.forEach((delElem) => {
    delElem.style.display = "none";
  });
});
