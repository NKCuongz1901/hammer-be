"use client";

import { useParams } from "next/navigation";
import { Card } from "@astryxdesign/core/Card";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
import { Badge } from "@astryxdesign/core/Badge";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { HStack } from "@astryxdesign/core/HStack";
import { DetailPage } from "../../components/DetailPage";
import { fetchRecommendationById, type Recommendation } from "../../lib/api";
import { formatDate, formatScore } from "../../lib/format";

export default function RecommendationDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <DetailPage<Recommendation>
      id={params.id}
      fetcher={fetchRecommendationById}
      backHref="/recommendation"
      backLabel="Back to recommendations"
      renderTitle={(r) => r.opportunity?.title ?? "Recommendation"}
      render={(r) => (
        <VStack gap={5}>
          <Card padding={6}>
            <MetadataList columns="multi">
              <MetadataListItem label="Dancer">
                {r.dancer ? (
                  <Link href={`/dancer/${r.dancerId}`}>
                    {r.dancer.fullName}
                  </Link>
                ) : (
                  "—"
                )}
              </MetadataListItem>
              <MetadataListItem label="Opportunity">
                <Link href={`/opportunity/${r.opportunityId}`}>
                  {r.opportunity?.title ?? "—"}
                </Link>
              </MetadataListItem>
              <MetadataListItem label="Status">
                <Badge label={r.status} variant="neutral" />
              </MetadataListItem>
              <MetadataListItem label="Final score">
                {formatScore(r.finalScore)}
              </MetadataListItem>
              <MetadataListItem label="Created">
                {formatDate(r.createdAt)}
              </MetadataListItem>
            </MetadataList>
          </Card>

          <VStack gap={2}>
            <Text type="label">Score breakdown</Text>
            <Card padding={6}>
              <MetadataList columns="multi">
                <MetadataListItem label="Style">
                  {formatScore(r.styleScore)}
                </MetadataListItem>
                <MetadataListItem label="Location">
                  {formatScore(r.locationScore)}
                </MetadataListItem>
                <MetadataListItem label="Type">
                  {formatScore(r.typeScore)}
                </MetadataListItem>
                <MetadataListItem label="Availability">
                  {formatScore(r.availabilityScore)}
                </MetadataListItem>
                <MetadataListItem label="Experience">
                  {formatScore(r.experienceScore)}
                </MetadataListItem>
                <MetadataListItem label="Compensation">
                  {formatScore(r.compensationScore)}
                </MetadataListItem>
              </MetadataList>
            </Card>
          </VStack>

          {r.reason ? (
            <VStack gap={1}>
              <Text type="label">Reason</Text>
              <Text type="body">{r.reason}</Text>
            </VStack>
          ) : null}

          {r.risks && r.risks.length > 0 ? (
            <VStack gap={2}>
              <Text type="label">Risks</Text>
              <HStack gap={2} wrap="wrap">
                {r.risks.map((risk, i) => (
                  <Badge key={i} label={risk} variant="warning" />
                ))}
              </HStack>
            </VStack>
          ) : null}

          {r.suggestedMessage ? (
            <VStack gap={1}>
              <Text type="label">Suggested message</Text>
              <Card padding={6}>
                <Text type="body">{r.suggestedMessage}</Text>
              </Card>
            </VStack>
          ) : null}
        </VStack>
      )}
    />
  );
}
