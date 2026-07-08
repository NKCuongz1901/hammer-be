"use client";

import { useEffect, useState, type ReactNode } from "react";
import { VStack } from "@astryxdesign/core/VStack";
import { Heading, Text } from "@astryxdesign/core/Text";
import { Link } from "@astryxdesign/core/Link";

interface DetailPageProps<T> {
  id: string;
  fetcher: (id: string) => Promise<T | null>;
  backHref: string;
  backLabel: string;
  renderTitle: (data: T) => ReactNode;
  render: (data: T) => ReactNode;
}

export function DetailPage<T>({
  id,
  fetcher,
  backHref,
  backLabel,
  renderTitle,
  render,
}: DetailPageProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const result = await fetcher(id);
        if (!active) return;
        if (result === null) {
          setNotFound(true);
          setData(null);
        } else {
          setData(result);
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [id, fetcher]);

  return (
    <VStack gap={4}>
      <Link href={backHref}>&larr; {backLabel}</Link>

      {loading ? (
        <Text type="body">Loading&hellip;</Text>
      ) : error ? (
        <Text type="body">Could not load record: {error}</Text>
      ) : notFound || !data ? (
        <Text type="body">Record not found.</Text>
      ) : (
        <VStack gap={4}>
          <Heading level={3}>{renderTitle(data)}</Heading>
          {render(data)}
        </VStack>
      )}
    </VStack>
  );
}
