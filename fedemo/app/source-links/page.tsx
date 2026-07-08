"use client";

import { proportional, pixel } from "@astryxdesign/core/Table";
import type { TableColumn } from "@astryxdesign/core/Table";
import { Badge } from "@astryxdesign/core/Badge";
import { Link } from "@astryxdesign/core/Link";
import { HStack } from "@astryxdesign/core/HStack";
import { VStack } from "@astryxdesign/core/VStack";
import { PaginatedTable } from "../components/PaginatedTable";
import { CrawlPipelineDialog } from "../components/CrawlPipelineDialog";
import { fetchSourceLinks, type SourceLink } from "../lib/api";
import { formatDate, formatLocation } from "../lib/format";

const CRAWL_STATUS_VARIANT: Record<
  string,
  "success" | "error" | "neutral"
> = {
  success: "success",
  failed: "error",
};

const columns: TableColumn<SourceLink>[] = [
  {
    key: "name",
    header: "Name",
    width: proportional(2),
    renderCell: (item) => (
      <Link href={`/source-links/${item.id}`}>{item.name}</Link>
    ),
  },
  {
    key: "category",
    header: "Category",
    width: proportional(1),
    renderCell: (item) => <Badge label={item.category} variant="blue" />,
  },
  {
    key: "url",
    header: "URL",
    width: proportional(2),
    renderCell: (item) => (
      <Link href={item.url} isExternalLink>
        {item.url}
      </Link>
    ),
  },
  {
    key: "location",
    header: "Location",
    width: proportional(1),
    renderCell: (item) => formatLocation(item.city, item.country),
  },
  {
    key: "enabled",
    header: "Enabled",
    width: pixel(100),
    renderCell: (item) =>
      item.enabled ? (
        <Badge label="Enabled" variant="success" />
      ) : (
        <Badge label="Disabled" variant="neutral" />
      ),
  },
  {
    key: "crawlStatus",
    header: "Crawl Status",
    width: pixel(120),
    renderCell: (item) =>
      item.crawlStatus ? (
        <Badge
          label={item.crawlStatus}
          variant={CRAWL_STATUS_VARIANT[item.crawlStatus] ?? "neutral"}
        />
      ) : (
        "—"
      ),
  },
  {
    key: "priority",
    header: "Priority",
    width: pixel(90),
    renderCell: (item) => String(item.priority),
  },
  {
    key: "lastCrawledAt",
    header: "Last Crawled",
    width: pixel(140),
    renderCell: (item) => formatDate(item.lastCrawledAt),
  },
];

export default function SourceLinksPage() {
  return (
    <VStack gap={4}>
      <HStack justify="end">
        <CrawlPipelineDialog />
      </HStack>
      <PaginatedTable<SourceLink>
        title="Source Links"
        description="Configured sources used by the crawler."
        columns={columns}
        fetcher={fetchSourceLinks}
      />
    </VStack>
  );
}
