"use client";

import { useParams } from "next/navigation";
import { Card } from "@astryxdesign/core/Card";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
import { Badge } from "@astryxdesign/core/Badge";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { DetailPage } from "../../components/DetailPage";
import { DancerRecommendations } from "../../components/DancerRecommendations";
import { fetchDancerById, type DancerDetail } from "../../lib/api";
import {
  formatList,
  formatLocation,
  formatText,
} from "../../lib/format";

export default function DancerDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <DetailPage<DancerDetail>
      id={params.id}
      fetcher={fetchDancerById}
      backHref="/dancer"
      backLabel="Back to dancers"
      renderTitle={(d) => d.fullName}
      render={(d) => (
        <VStack gap={5}>
          <Card padding={6}>
            <MetadataList columns="multi">
              <MetadataListItem label="Status">
                {d.isActive ? (
                  <Badge label="Active" variant="success" />
                ) : (
                  <Badge label="Inactive" variant="neutral" />
                )}
              </MetadataListItem>
              <MetadataListItem label="Email">
                {d.email ? (
                  <Link href={`mailto:${d.email}`}>{d.email}</Link>
                ) : (
                  "—"
                )}
              </MetadataListItem>
              <MetadataListItem label="Phone">
                {formatText(d.phone)}
              </MetadataListItem>
              <MetadataListItem label="Location">
                {formatLocation(d.city, d.country)}
              </MetadataListItem>
              <MetadataListItem label="Skill level">
                {formatText(d.skillLevel)}
              </MetadataListItem>
              <MetadataListItem label="Experience">
                {d.yearsExperience != null ? `${d.yearsExperience} years` : "—"}
              </MetadataListItem>
              <MetadataListItem label="Dance styles">
                {formatList(d.danceStyles)}
              </MetadataListItem>
              <MetadataListItem label="Preferred types">
                {formatList(d.preferredTypes)}
              </MetadataListItem>
              <MetadataListItem label="Languages">
                {formatList(d.languages)}
              </MetadataListItem>
              <MetadataListItem label="Travel radius">
                {d.travelRadiusKm != null ? `${d.travelRadiusKm} km` : "—"}
              </MetadataListItem>
              <MetadataListItem label="Min compensation">
                {d.minCompensation != null
                  ? `${d.minCompensation} ${d.currency ?? ""}`.trim()
                  : "—"}
              </MetadataListItem>
            </MetadataList>
          </Card>

          {d.profileDescription ? (
            <VStack gap={1}>
              <Text type="label">Profile</Text>
              <Text type="body">{d.profileDescription}</Text>
            </VStack>
          ) : null}

          <DancerRecommendations dancerId={d.id} />
        </VStack>
      )}
    />
  );
}
