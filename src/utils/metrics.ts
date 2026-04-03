import client from "prom-client";

// Création de registre Prometheus
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Métriques custom
export const documentsGenerated = new client.Counter({
  name: "documents_generated_total",
  help: "Nombre total de documents générés",
});
register.registerMetric(documentsGenerated);

export const batchProcessingDuration = new client.Histogram({
  name: "batch_processing_duration_seconds",
  help: "Durée de traitement des batches",
  buckets: [1, 5, 10, 30, 60, 120],
});
register.registerMetric(batchProcessingDuration);

// Comme il n’y a plus de queue, on remplace par une valeur fixe
export const queueSizeGauge = new client.Gauge({
  name: "queue_size",
  help: "Taille actuelle de la queue (désactivée)",
});
register.registerMetric(queueSizeGauge);

// Fonction pour mettre à jour queue size (ici fixe)
export async function updateQueueMetrics() {
  queueSizeGauge.set(0); // pas de queue, donc toujours 0
}

export { register };