// JS/SLIDEBAR.JS
document.addEventListener("DOMContentLoaded", function () {
  fetch("../components/slidebar.html")
    .then(res => res.text())
    .then(data => {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = data;
      document.body.prepend(tempDiv);

      const toggleBtn = document.getElementById("toggleBtn");
      const sidebar = document.getElementById("sidebar");

      toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open");
      });
    });
});
