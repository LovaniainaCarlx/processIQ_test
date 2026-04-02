const clientSelect = document.getElementById("clientSelect");
const output = document.getElementById("output");
const launchBtn = document.getElementById("launchBtn");

// 🔹 Charger les clients
async function loadClients() {
  try {
    const res = await fetch("https://processiq-test-2.onrender.com/api/clients");
    const clients = await res.json();

    clientSelect.innerHTML = "";

    clients.forEach(c => {
      const option = document.createElement("option");
      option.value = c.userId;
      option.textContent = c.name;
      clientSelect.appendChild(option);
    });

  } catch (err) {
    output.innerHTML = `<div class="error">Erreur chargement clients</div>`;
  }
}

loadClients();

// 🔹 Lancer le batch
launchBtn.addEventListener("click", async () => {
  const selected = Array.from(clientSelect.selectedOptions).map(o => o.value);

  if (!selected.length) {
    output.innerHTML = `<div class="error">Veuillez sélectionner au moins un client.</div>`;
    return;
  }

  output.innerHTML = `<div class="loading">Lancement du batch...</div>`;

  try {
    const res = await fetch("https://processiq-test-2.onrender.com/api/documents/batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userIds: selected })
    });

    const data = await res.json();

    if (data.error) {
      output.innerHTML = `<div class="error">${data.error}</div>`;
      return;
    }

    const batchId = data.batchId;

    output.innerHTML = `
      <div class="success">Batch lancé (ID: ${batchId})</div>
      <ul id="docList"></ul>
    `;

    const docList = document.getElementById("docList");

    const interval = setInterval(async () => {
      try {
        const statusRes = await fetch(`https://processiq-test-2.onrender.com/api/documents/batch/${batchId}`);
        const statusData = await statusRes.json();

        docList.innerHTML = "";

        statusData.documents.forEach(d => {
          const li = document.createElement("li");

          let statusClass =
            d.status === "completed" ? "badge success" :
            d.status === "failed" ? "badge error" :
            "badge pending";

          li.innerHTML = `
            <span class="${statusClass}">${d.status}</span>
            <span class="filename">${d.filename}</span>
            ${
              d.status === "completed"
                ? `<a href="https://processiq-test-2.onrender.com/api/documents/${d.documentId}" target="_blank">Télécharger</a>`
                : ""
            }
          `;

          docList.appendChild(li);
        });

        const allDone = statusData.documents.every(
          d => d.status === "completed" || d.status === "failed"
        );

        if (allDone) clearInterval(interval);

      } catch (err) {
        console.error("Erreur polling:", err);
      }
    }, 2000);

  } catch (err) {
    output.innerHTML = `<div class="error">${err.message}</div>`;
  }
});