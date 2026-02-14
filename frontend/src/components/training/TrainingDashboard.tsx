"use client";

import { useTrainingStore } from "@/store/trainingStore";
import { useGraphStore } from "@/store/graphStore";
import { serializeGraph } from "@/lib/serialization";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

const DATASETS = [
  { id: "mnist", label: "MNIST", description: "Handwritten digits, 28×28" },
  {
    id: "fashion_mnist",
    label: "Fashion-MNIST",
    description: "Clothing items, 28×28",
  },
  {
    id: "cifar10",
    label: "CIFAR-10",
    description: "Color images 32×32, 10 classes",
  },
];

const inputClass =
  "w-full px-3 py-2 rounded-lg text-sm bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] disabled:opacity-50 transition-all";

export default function TrainingDashboard() {
  const { nodes, edges } = useGraphStore();
  const {
    status,
    datasetId,
    config,
    metrics,
    currentEpoch,
    currentBatchLoss,
    errorMessage,
    setDataset,
    setConfig,
    startTraining,
    addMetric,
    setBatchLoss,
    setCompleted,
    setError,
    setStopped,
    reset,
    ws,
    setWs,
  } = useTrainingStore();

  const handleStartTraining = async () => {
    try {
      const graph = serializeGraph(nodes, edges);
      const res = await fetch(`${API_BASE}/api/training/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph,
          dataset_id: datasetId,
          training_config: config,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "Failed to start training");
        return;
      }

      const { job_id } = await res.json();
      startTraining(job_id);

      const socket = new WebSocket(`${WS_BASE}/ws/training/${job_id}`);
      setWs(socket);

      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case "batch":
            setBatchLoss(msg.loss, msg.epoch);
            break;
          case "epoch":
            addMetric({
              epoch: msg.epoch,
              train_loss: msg.train_loss,
              val_loss: msg.val_loss,
              train_acc: msg.train_acc,
              val_acc: msg.val_acc,
              elapsed_sec: msg.elapsed_sec,
            });
            break;
          case "completed":
            setCompleted();
            socket.close();
            break;
          case "error":
            setError(msg.message);
            socket.close();
            break;
        }
      };

      socket.onerror = () => {
        setError("WebSocket connection failed");
      };
    } catch {
      setError("Failed to connect to backend");
    }
  };

  const handleStop = () => {
    if (ws) {
      ws.send(JSON.stringify({ type: "stop" }));
      ws.close();
      setWs(null);
    }
    setStopped();
  };

  const isIdle =
    status === "idle" ||
    status === "completed" ||
    status === "error" ||
    status === "stopped";

  const chartStroke = {
    train: "var(--accent)",
    val: "#f43f5e",
  };

  return (
    <div className="w-80 flex-shrink-0 border-l border-[var(--border-muted)] bg-[var(--surface)] overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-[var(--border-muted)]">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] mb-4">
          Training
        </h2>

        <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
          Dataset
        </label>
        <select
          value={datasetId}
          onChange={(e) => setDataset(e.target.value)}
          disabled={!isIdle}
          className={`${inputClass} mb-4`}
        >
          {DATASETS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label} — {d.description}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
              Epochs
            </label>
            <input
              type="number"
              value={config.epochs}
              min={1}
              max={100}
              onChange={(e) =>
                setConfig({ epochs: parseInt(e.target.value) || 1 })
              }
              disabled={!isIdle}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
              Batch Size
            </label>
            <input
              type="number"
              value={config.batch_size}
              min={1}
              onChange={(e) =>
                setConfig({ batch_size: parseInt(e.target.value) || 1 })
              }
              disabled={!isIdle}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
              Learning Rate
            </label>
            <input
              type="number"
              value={config.learning_rate}
              min={0.0001}
              max={1}
              step={0.0001}
              onChange={(e) =>
                setConfig({
                  learning_rate: parseFloat(e.target.value) || 0.001,
                })
              }
              disabled={!isIdle}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
              Optimizer
            </label>
            <select
              value={config.optimizer}
              onChange={(e) =>
                setConfig({
                  optimizer: e.target.value as "adam" | "sgd" | "adamw",
                })
              }
              disabled={!isIdle}
              className={inputClass}
            >
              <option value="adam">Adam</option>
              <option value="sgd">SGD</option>
              <option value="adamw">AdamW</option>
            </select>
          </div>
        </div>

        {isIdle ? (
          <button
            onClick={handleStartTraining}
            disabled={nodes.length === 0}
            className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-[var(--success)] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Start Training
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-[var(--danger)] text-white hover:opacity-90 transition-all"
          >
            Stop Training
          </button>
        )}

        {status === "error" && (
          <div className="mt-3 text-xs text-[var(--danger)] bg-[var(--danger-muted)] p-2.5 rounded-lg">
            {errorMessage}
          </div>
        )}

        {status === "completed" && (
          <div className="mt-3 text-xs text-[var(--success)] bg-[var(--success-muted)] p-2.5 rounded-lg flex items-center justify-between">
            <span>Training completed!</span>
            <button
              onClick={reset}
              className="font-medium underline hover:no-underline"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {(status === "running" || metrics.length > 0) && (
        <div className="p-4 flex-1">
          {status === "running" && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-[var(--foreground-muted)] mb-1.5">
                <span>
                  Epoch {currentEpoch} / {config.epochs}
                </span>
                {currentBatchLoss !== null && (
                  <span className="font-mono text-[var(--accent)]">
                    Loss: {currentBatchLoss.toFixed(4)}
                  </span>
                )}
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--surface-elevated)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-cyan-400 transition-all duration-300"
                  style={{
                    width: `${(currentEpoch / config.epochs) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {metrics.length > 0 && (
            <>
              <h3 className="text-xs font-semibold text-[var(--foreground-muted)] mb-2">
                Loss
              </h3>
              <div className="h-40 mb-5">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border-muted)"
                    />
                    <XAxis
                      dataKey="epoch"
                      tick={{ fontSize: 10, fill: "var(--foreground-muted)" }}
                      stroke="var(--border-muted)"
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "var(--foreground-muted)" }}
                      stroke="var(--border-muted)"
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 11,
                        background: "var(--surface-elevated)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                      }}
                      formatter={(value) =>
                        typeof value === "number" ? value.toFixed(4) : value
                      }
                    />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="train_loss"
                      stroke={chartStroke.train}
                      strokeWidth={2}
                      dot={false}
                      name="Train"
                    />
                    <Line
                      type="monotone"
                      dataKey="val_loss"
                      stroke={chartStroke.val}
                      strokeWidth={2}
                      dot={false}
                      name="Validation"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {metrics[0]?.val_acc !== undefined && (
                <>
                  <h3 className="text-xs font-semibold text-[var(--foreground-muted)] mb-2">
                    Accuracy
                  </h3>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metrics}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--border-muted)"
                        />
                        <XAxis
                          dataKey="epoch"
                          tick={{
                            fontSize: 10,
                            fill: "var(--foreground-muted)",
                          }}
                          stroke="var(--border-muted)"
                        />
                        <YAxis
                          tick={{
                            fontSize: 10,
                            fill: "var(--foreground-muted)",
                          }}
                          stroke="var(--border-muted)"
                          domain={[0, 1]}
                          tickFormatter={(v) =>
                            `${(Number(v) * 100).toFixed(0)}%`
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            fontSize: 11,
                            background: "var(--surface-elevated)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius)",
                          }}
                          formatter={(value) =>
                            typeof value === "number"
                              ? `${(value * 100).toFixed(1)}%`
                              : value
                          }
                        />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Line
                          type="monotone"
                          dataKey="train_acc"
                          stroke={chartStroke.train}
                          strokeWidth={2}
                          dot={false}
                          name="Train"
                        />
                        <Line
                          type="monotone"
                          dataKey="val_acc"
                          stroke={chartStroke.val}
                          strokeWidth={2}
                          dot={false}
                          name="Validation"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
