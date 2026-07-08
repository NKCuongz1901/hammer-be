"use client";

import { proportional, pixel } from "@astryxdesign/core/Table";
import type { TableColumn } from "@astryxdesign/core/Table";
import { Badge } from "@astryxdesign/core/Badge";
import { Link } from "@astryxdesign/core/Link";
import { PaginatedTable } from "../components/PaginatedTable";
import { fetchDancers, type Dancer } from "../lib/api";
import { formatList, formatLocation, formatText } from "../lib/format";

const columns: TableColumn<Dancer>[] = [
  {
    key: "fullName",
    header: "Name",
    width: proportional(1),
    renderCell: (item) => (
      <Link href={`/dancer/${item.id}`}>{item.fullName}</Link>
    ),
  },
  {
    key: "email",
    header: "Email",
    width: proportional(1),
    renderCell: (item) => formatText(item.email),
  },
  {
    key: "location",
    header: "Location",
    width: proportional(1),
    renderCell: (item) => formatLocation(item.city, item.country),
  },
  {
    key: "danceStyles",
    header: "Dance styles",
    width: proportional(1),
    renderCell: (item) => formatList(item.danceStyles),
  },
  {
    key: "skillLevel",
    header: "Skill",
    width: pixel(120),
    renderCell: (item) => formatText(item.skillLevel),
  },
  {
    key: "isActive",
    header: "Active",
    width: pixel(100),
    renderCell: (item) =>
      item.isActive ? (
        <Badge label="Active" variant="success" />
      ) : (
        <Badge label="Inactive" variant="neutral" />
      ),
  },
];

export default function DancerPage() {
  return (
    <PaginatedTable<Dancer>
      title="Dancers"
      description="Registered dancers available for matching."
      columns={columns}
      fetcher={fetchDancers}
    />
  );
}
