"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Layout, LayoutContent } from "@astryxdesign/core/Layout";
import { VStack } from "@astryxdesign/core/VStack";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Badge } from "@astryxdesign/core/Badge";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { Divider } from "@astryxdesign/core/Divider";
import { API_BASE_URL } from "../lib/api";

type StepStatus = "pending" | "running" | "done" | "error";

interface StepState {
  key: string;
  label: string;
  status: StepStatus;
  count: number;
  errorCount: number;
}

const STEP_DEFS: { key: string; label: string; countField: string }[] = [
  {
    key: "importCsv",
    label: "Import & select sources",
    countField: "sourceIds",
  },
  { key: "crawlSources", label: "Crawl pages", countField: "rawPageIds" },
  {
    key: "extractOpportunities",
    label: "Extract opportunities",
    countField: "opportunityIds",
  },
  {
    key: "matchOpportunities",
    label: "Match & recommend",
    countField: "recommendationIds",
  },
];

const DOT_VARIANT: Record<StepStatus, "neutral" | "accent" | "success" | "error"> = {
  pending: "neutral",
  running: "accent",
  done: "success",
  error: "error",
};

const STATUS_LABEL: Record<StepStatus, string> = {
  pending: "Pending",
  running: "Running",
  done: "Done",
  error: "Error",
};

function initialSteps(): StepState[] {
  return STEP_DEFS.map((d) => ({
    key: d.key,
    label: d.label,
    status: "pending",
    count: 0,
    errorCount: 0,
  }));
}

function countFieldFor(node: string): string | undefined {
  return STEP_DEFS.find((d) => d.key === node)?.countField;
}

export function CrawlPipelineDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [steps, setSteps] = useState<StepState[]>(initialSteps);
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const esRef = useRef<EventSource | null>(null);
  const finishedRef = useRef(false);

  const closeStream = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
  }, []);

  const stop = useCallback(
    (message?: string) => {
      finishedRef.current = true;
      setFinished(true);
      setRunning(false);
      if (message) setErrorMsg(message);
      closeStream();
    },
    [closeStream],
  );

  const appendLogs = useCallback((entries?: string[], prefix = "") => {
    if (!entries?.length) return;
    setLogs((prev) => [...prev, ...entries.map((e) => `${prefix}${e}`)]);
  }, []);

  const handleEvent = useCallback(
    (payload: {
      type: string;
      node?: string;
      update?: Record<string, unknown>;
      message?: string;
    }) => {
      if (payload.type === "start") {
        setSteps((prev) =>
          prev.map((s, i) => (i === 0 ? { ...s, status: "running" } : s)),
        );
        return;
      }

      if (payload.type === "node" && payload.node) {
        const node = payload.node;
        const update = payload.update ?? {};
        const field = countFieldFor(node);
        const countValue = field ? update[field] : undefined;
        const count = Array.isArray(countValue) ? countValue.length : 0;
        const errorsValue = update["errors"];
        const errorCount = Array.isArray(errorsValue) ? errorsValue.length : 0;

        appendLogs(update["logs"] as string[] | undefined);
        appendLogs(errorsValue as string[] | undefined, "⚠ ");

        setSteps((prev) => {
          const idx = prev.findIndex((s) => s.key === node);
          if (idx === -1) return prev;
          const next = prev.map((s, i) =>
            i === idx ? { ...s, status: "done" as StepStatus, count, errorCount } : s,
          );
          const pendingIdx = next.findIndex((s) => s.status === "pending");
          if (pendingIdx !== -1) {
            next[pendingIdx] = { ...next[pendingIdx], status: "running" };
          }
          return next;
        });
        return;
      }

      if (payload.type === "done") {
        stop();
        return;
      }

      if (payload.type === "busy") {
        stop(payload.message ?? "Pipeline is already running");
        return;
      }

      if (payload.type === "error") {
        setSteps((prev) =>
          prev.map((s) =>
            s.status === "running" ? { ...s, status: "error" } : s,
          ),
        );
        stop(payload.message ?? "Pipeline failed");
      }
    },
    [appendLogs, stop],
  );

  const start = useCallback(() => {
    closeStream();
    finishedRef.current = false;
    setSteps(initialSteps());
    setLogs([]);
    setErrorMsg(null);
    setFinished(false);
    setRunning(true);
    setIsOpen(true);

    const es = new EventSource(`${API_BASE_URL}/scheduler/run-crawl/stream`);
    esRef.current = es;

    es.onmessage = (event) => {
      try {
        handleEvent(JSON.parse(event.data));
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => {
      if (!finishedRef.current) {
        stop("Connection to server lost");
      }
    };
  }, [closeStream, handleEvent, stop]);

  useEffect(() => {
    return () => {
      esRef.current?.close();
    };
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (!open) {
        closeStream();
      }
    },
    [closeStream],
  );

  const doneCount = steps.filter(
    (s) => s.status === "done" || s.status === "error",
  ).length;
  const progress = Math.round((doneCount / steps.length) * 100);

  return (
    <>
      <Button
        label="Crawl opportunities"
        variant="primary"
        onClick={start}
        isLoading={running}
      />

      <Dialog isOpen={isOpen} onOpenChange={handleOpenChange} width={560}>
        <Layout
          header={
            <DialogHeader
              title="Crawl pipeline"
              subtitle="LangGraph agent progress"
              onOpenChange={handleOpenChange}
            />
          }
          content={
            <LayoutContent>
              <VStack gap={4}>
                <ProgressBar
                  label="Pipeline progress"
                  value={progress}
                  hasValueLabel
                  variant={errorMsg ? "error" : finished ? "success" : "accent"}
                />

                <VStack gap={3}>
                  {steps.map((step) => (
                    <HStack key={step.key} gap={3} align="center">
                      <StatusDot
                        variant={DOT_VARIANT[step.status]}
                        label={STATUS_LABEL[step.status]}
                        isPulsing={step.status === "running"}
                      />
                      <Text type="body">{step.label}</Text>
                      {step.status === "done" || step.status === "error" ? (
                        <Badge
                          label={String(step.count)}
                          variant="neutral"
                        />
                      ) : null}
                      {step.errorCount > 0 ? (
                        <Badge
                          label={`${step.errorCount} errors`}
                          variant="warning"
                        />
                      ) : null}
                    </HStack>
                  ))}
                </VStack>

                {errorMsg ? (
                  <Text type="body" color="accent">
                    {errorMsg}
                  </Text>
                ) : null}

                {logs.length > 0 ? (
                  <>
                    <Divider />
                    <VStack gap={1}>
                      <Text type="label">Logs</Text>
                      {logs.map((line, i) => (
                        <Text key={i} type="code">
                          {line}
                        </Text>
                      ))}
                    </VStack>
                  </>
                ) : null}
              </VStack>
            </LayoutContent>
          }
        />
      </Dialog>
    </>
  );
}
