document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("footer-container");
  if (container) {
    const response = await fetch("../components/footer.html"); // sube desde /Pages a raíz
    const html = await response.text();
    container.innerHTML = html;
  }
});

