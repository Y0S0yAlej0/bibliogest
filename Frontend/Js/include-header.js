// js/include-header.js

document.addEventListener("DOMContentLoaded", function () {
  const headerContainer = document.getElementById("header-container");

  fetch("../components/header.html") // subir un nivel desde Pages/
    .then(response => {
      if (!response.ok) {
        throw new Error("No se pudo cargar el header");
      }
      return response.text();
    })
    .then(data => {
      headerContainer.innerHTML = data;
    })
    .catch(error => {
      console.error("Error al incluir el header:", error);
    });
});
