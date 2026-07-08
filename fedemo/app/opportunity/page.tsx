"use client";

import { proportional, pixel } from "@astryxdesign/core/Table";
import type { TableColumn } from "@astryxdesign/core/Table";
import { Badge } from "@astryxdesign/core/Badge";
import { Link } from "@astryxdesign/core/Link";
import { PaginatedTable } from "../components/PaginatedTable";
import { fetchOpportunities, type Opportunity } from "../lib/api";
import { formatDate, formatLocation } from "../lib/format";

const STATUS_VARIANT: Record<
  string,
  "success" | "warning" | "neutral" | "info"
> = {
  complete: "success",
  incomplete: "warning",
  new: "info",
};

const columns: TableColumn<Opportunity>[] = [
  {
    key: "title",
    header: "Title",
    width: proportional(2),
    renderCell: (item) => (
      <Link href={`/opportunity/${item.id}`}>{item.title}</Link>
    ),
  },
  {
    key: "organization",
    header: "Organization",
    width: proportional(1),
    renderCell: (item) => item.organization || "—",
  },
  {
    key: "opportunityType",
    header: "Type",
    width: proportional(1),
    renderCell: (item) => item.opportunityType || "—",
  },
  {
    key: "location",
    header: "Location",
    width: proportional(1),
    renderCell: (item) => formatLocation(item.city, item.country),
  },
  {
    key: "status",
    header: "Status",
    width: pixel(120),
    renderCell: (item) => (
      <Badge
        label={item.status}
        variant={STATUS_VARIANT[item.status] ?? "neutral"}
      />
    ),
  },
  {
    key: "deadline",
    header: "Deadline",
    width: pixel(130),
    renderCell: (item) => formatDate(item.deadline),
  },
  {
    key: "applicationUrl",
    header: "Apply",
    width: pixel(90),
    renderCell: (item) =>
      item.applicationUrl ? (
        <Link href={item.applicationUrl} isExternalLink>
          Link
        </Link>
      ) : (
        "—"
      ),
  },
];

export default function OpportunityPage() {
  return (
    <PaginatedTable<Opportunity>
      title="Opportunities"
      description="Extracted dance opportunities from crawled sources."
      columns={columns}
      fetcher={fetchOpportunities}
    />
  );
}
