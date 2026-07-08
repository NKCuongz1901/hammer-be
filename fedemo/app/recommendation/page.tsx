"use client";

import { proportional, pixel } from "@astryxdesign/core/Table";
import type { TableColumn } from "@astryxdesign/core/Table";
import { Badge } from "@astryxdesign/core/Badge";
import { Link } from "@astryxdesign/core/Link";
import { PaginatedTable } from "../components/PaginatedTable";
import { fetchRecommendations, type Recommendation } from "../lib/api";
import { formatDate, formatScore, formatText } from "../lib/format";

function scoreVariant(score: number): "success" | "warning" | "neutral" {
  if (score >= 0.7) return "success";
  if (score >= 0.4) return "warning";
  return "neutral";
}

const columns: TableColumn<Recommendation>[] = [
  {
    key: "opportunity",
    header: "Opportunity",
    width: proportional(2),
    renderCell: (item) => (
      <Link href={`/recommendation/${item.id}`}>
        {item.opportunity?.title ?? "—"}
      </Link>
    ),
  },
  {
    key: "dancer",
    header: "Dancer",
    width: proportional(1),
    renderCell: (item) =>
      item.dancer ? (
        <Link href={`/dancer/${item.dancerId}`}>{item.dancer.fullName}</Link>
      ) : (
        "—"
      ),
  },
  {
    key: "finalScore",
    header: "Score",
    width: pixel(90),
    renderCell: (item) => (
      <Badge
        label={formatScore(item.finalScore)}
        variant={scoreVariant(item.finalScore)}
      />
    ),
  },
  {
    key: "status",
    header: "Status",
    width: pixel(150),
    renderCell: (item) => <Badge label={item.status} variant="neutral" />,
  },
  {
    key: "reason",
    header: "Reason",
    width: proportional(2),
    renderCell: (item) => formatText(item.reason),
  },
  {
    key: "createdAt",
    header: "Created",
    width: pixel(130),
    renderCell: (item) => formatDate(item.createdAt),
  },
];

export default function RecommendationPage() {
  return (
    <PaginatedTable<Recommendation>
      title="Recommendations"
      description="Dancer–opportunity matches ranked by score."
      columns={columns}
      fetcher={fetchRecommendations}
    />
  );
}
