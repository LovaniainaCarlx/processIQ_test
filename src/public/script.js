const API_URL = "https://processiq-test-2.onrender.com";

// Récupérer le token depuis le localStorage
const token = localStorage.getItem("token");

// Elements DOM
const clientSelect = document.getElementById("clientSelect");
const output = document.getElementById("output");
const launchBtn = document.getElementById("launchBtn");
const addClientBtn = document.getElementById("addClientBtn");
const nameInput = document.getElementById("nameInput");
const idInput = document.getElementById("idInput");

// ======================
// 🔹 Charger les clients
// ======================
async function loadClients() {
  try {
    const res = await fetch(`${API_URL}/api/clients`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Erreur chargement clients");

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

// ======================
// 🔹 Ajouter un client
// ======================
addClientBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim();
  const userId = idInput.value.trim();

  if (!name || !userId) {
    output.innerHTML = `<div class="error">Tous les champs sont requis</div>`;
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/clients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ userId, name })
    });

    const data = await res.json();

    if (!res.ok) {
      output.innerHTML = `<div class="error">${data.error || "Erreur ajout client"}</div>`;
      return;
    }

    output.innerHTML = `<div class="success">Client ajouté avec succès</div>`;

    nameInput.value = "";
    idInput.value = "";

    loadClients();
  } catch (err) {
    output.innerHTML = `<div class="error">Erreur ajout client</div>`;
  }
});

// ======================
// 🔹 Lancer le batch
// ======================
launchBtn.addEventListener("click", async () => {
  const selected = Array.from(clientSelect.selectedOptions).map(o => o.value);

  if (!selected.length) {
    output.innerHTML = `<div class="error">Veuillez sélectionner au moins un client.</div>`;
    return;
  }

  output.innerHTML = `<div class="loading">Lancement du batch...</div>`;

  try {
    const res = await fetch(`${API_URL}/api/documents/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ userIds: selected })
    });

    const data = await res.json();
    if (data.error) {
      output.innerHTML = `<div class="error">${data.error}</div>`;
      return;
    }

    const batchId = data.batchId;
    output.innerHTML = `<div class="success">Batch lancé (ID: ${batchId})</div><ul id="docList"></ul>`;
    const docList = document.getElementById("docList");

    const interval = setInterval(async () => {
      const statusRes = await fetch(`${API_URL}/api/documents/batch/${batchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
          ${d.status === "completed"
            ? `<a href="${API_URL}/api/documents/${d.documentId}" target="_blank">Télécharger</a>`
            : ""}
        `;
        docList.appendChild(li);
      });

      const allDone = statusData.documents.every(d => d.status === "completed" || d.status === "failed");
      if (allDone) clearInterval(interval);

    }, 2000);

  } catch (err) {
    output.innerHTML = `<div class="error">Erreur batch</div>`;
  }
});