"use client";

import { useEffect, useState } from "react";
import { Table, proportional, pixel } from "@astryxdesign/core/Table";
import type { TableColumn } from "@astryxdesign/core/Table";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { HStack } from "@astryxdesign/core/HStack";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Layout, LayoutContent } from "@astryxdesign/core/Layout";
import {
  fetchDancerRecommendations,
  fetchDraftEmail,
  type Recommendation,
} from "../lib/api";
import { formatDate, formatLocation, formatText } from "../lib/format";

function scoreVariant(score: number): "success" | "warning" | "neutral" {
  if (score >= 0.7) return "success";
  if (score >= 0.4) return "warning";
  return "neutral";
}

export function DancerRecommendations({ dancerId }: { dancerId: string }) {
  const [rows, setRows] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [draftOpen, setDraftOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [draftContent, setDraftContent] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchDancerRecommendations(dancerId)
      .then((data) => {
        if (active) setRows(data);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load recommendations",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dancerId]);

  const openDraft = async (rec: Recommendation) => {
    setDraftOpen(true);
    setDraftTitle(rec.opportunity?.title ?? "Draft email");
    setDraftLoading(true);
    setDraftError(null);
    setDraftContent("");
    setCopied(false);

    try {
      const message = await fetchDraftEmail(rec.id);
      setDraftContent(message);
    } catch (err) {
      setDraftError(
        err instanceof Error ? err.message : "Failed to generate draft email",
      );
    } finally {
      setDraftLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draftContent);
      setCopied(true);
    } catch {
      // clipboard unavailable; ignore
    }
  };

  const columns: TableColumn<Recommendation>[] = [
    {
      key: "title",
      header: "Opportunity",
      width: proportional(2),
      renderCell: (item) => (
        <Link href={`/opportunity/${item.opportunityId}`}>
          {item.opportunity?.title ?? "—"}
        </Link>
      ),
    },
    {
      key: "organization",
      header: "Organization",
      width: proportional(1),
      renderCell: (item) => formatText(item.opportunity?.organization),
    },
    {
      key: "location",
      header: "Location",
      width: proportional(1),
      renderCell: (item) =>
        formatLocation(item.opportunity?.city, item.opportunity?.country),
    },
    {
      key: "finalScore",
      header: "Score",
      width: pixel(80),
      renderCell: (item) => (
        <Badge
          label={item.finalScore.toFixed(2)}
          variant={scoreVariant(item.finalScore)}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      width: pixel(130),
      renderCell: (item) => <Badge label={item.status} variant="neutral" />,
    },
    {
      key: "actions",
      header: "",
      width: pixel(140),
      renderCell: (item) => (
        <Button
          label="Create draft"
          size="sm"
          variant="secondary"
          onClick={() => openDraft(item)}
        />
      ),
    },
  ];

  return (
    <VStack gap={2}>
      <Text type="label">{`Recommended jobs${rows.length ? ` (${rows.length})` : ""}`}</Text>

      {error ? (
        <Text type="body">Could not load recommendations: {error}</Text>
      ) : loading ? (
        <Text type="body">Loading&hellip;</Text>
      ) : rows.length === 0 ? (
        <Text type="body">No recommendations yet for this dancer.</Text>
      ) : (
        <Table
          data={rows}
          columns={columns}
          idKey="id"
          hasHover
          textOverflow="truncate"
        />
      )}

      <Dialog isOpen={draftOpen} onOpenChange={setDraftOpen} width={640}>
        <Layout
          header={
            <DialogHeader
              title="Draft email"
              subtitle={draftTitle}
              onOpenChange={setDraftOpen}
            />
          }
          content={
            <LayoutContent>
              <VStack gap={4}>
                {draftError ? (
                  <Text type="body">
                    Could not generate draft: {draftError}
                  </Text>
                ) : draftLoading ? (
                  <Text type="body">Generating draft email&hellip;</Text>
                ) : (
                  <VStack gap={2}>
                    {draftContent.split("\n").map((line, i) => (
                      <Text key={i} type="body">
                        {line === "" ? "\u00A0" : line}
                      </Text>
                    ))}
                  </VStack>
                )}

                {!draftLoading && !draftError && draftContent ? (
                  <HStack gap={2} justify="end">
                    <Button
                      label={copied ? "Copied" : "Copy"}
                      variant="secondary"
                      onClick={handleCopy}
                    />
                  </HStack>
                ) : null}
              </VStack>
            </LayoutContent>
          }
        />
      </Dialog>
    </VStack>
  );
}
