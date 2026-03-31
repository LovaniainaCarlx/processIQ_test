import fetch from "node-fetch";
import { performance } from "perf_hooks";
import pidusage from "pidusage";

const userIds = Array.from({ length: 100 }, (_, i) => `user${i}`);

(async () => {
  console.log("📊 Démarrage du benchmark...");

  const start = performance.now();

  // 1. Créer batch
  const res = await fetch("http://localhost:3000/api/documents/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userIds }),
  });

  const { batchId } = await res.json();

  console.log(`✅ Batch créé avec 1000 documents`);

  // 2. Attendre fin du batch
  let completed = false;

  while (!completed) {
    const statusRes = await fetch(
      `http://localhost:3000/api/documents/batch/${batchId}`
    );

    const data = await statusRes.json();

    console.log(`📌 Status: ${data.status}`);

    if (data.status === "completed") {
      completed = true;
      break;
    }

    // CPU + mémoire
    const stats = await pidusage(process.pid);
    console.log(
      `💻 CPU: ${stats.cpu.toFixed(2)}% | Memory: ${(stats.memory / 1024 / 1024).toFixed(2)} MB`
    );

    await new Promise((r) => setTimeout(r, 2000));
  }

  const end = performance.now();

  console.log(
    `⏱️ Temps TOTAL pour 1000 documents: ${((end - start) / 1000).toFixed(2)} secondes`
  );
})();