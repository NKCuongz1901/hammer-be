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
import {
  fetchOpportunityById,
  parseJsonField,
  type OpportunityCompensation,
  type OpportunityDetail,
  type OpportunityRequirements,
} from "../../lib/api";
import {
  formatDate,
  formatList,
  formatLocation,
  formatText,
} from "../../lib/format";

function formatPay(c: OpportunityCompensation): string {
  if (c.raw && c.raw.trim()) return c.raw;
  const currency = c.currency ?? "";
  if (c.min != null && c.max != null)
    return `${c.min}–${c.max} ${currency}`.trim();
  if (c.min != null) return `from ${c.min} ${currency}`.trim();
  if (c.max != null) return `up to ${c.max} ${currency}`.trim();
  return "—";
}

const STATUS_VARIANT: Record<
  string,
  "success" | "warning" | "neutral" | "info"
> = {
  complete: "success",
  incomplete: "warning",
  new: "info",
};

export default function OpportunityDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <DetailPage<OpportunityDetail>
      id={params.id}
      fetcher={fetchOpportunityById}
      backHref="/opportunity"
      backLabel="Back to opportunities"
      renderTitle={(o) => o.title}
      render={(o) => (
        <VStack gap={4}>
          <Card padding={6}>
            <MetadataList columns="multi">
              <MetadataListItem label="Organization">
                {formatText(o.organization)}
              </MetadataListItem>
              <MetadataListItem label="Type">
                {formatText(o.opportunityType)}
              </MetadataListItem>
              <MetadataListItem label="Status">
                <Badge
                  label={o.status}
                  variant={STATUS_VARIANT[o.status] ?? "neutral"}
                />
              </MetadataListItem>
              <MetadataListItem label="Location">
                {formatLocation(o.city, o.country)}
              </MetadataListItem>
              <MetadataListItem label="Dance styles">
                {formatList(o.danceStyles)}
              </MetadataListItem>
              <MetadataListItem label="Deadline">
                {formatDate(o.deadline)}
              </MetadataListItem>
              <MetadataListItem label="Event start">
                {formatDate(o.eventStartDate)}
              </MetadataListItem>
              <MetadataListItem label="Event end">
                {formatDate(o.eventEndDate)}
              </MetadataListItem>
              <MetadataListItem label="Completeness">
                {`${o.completenessScore}%`}
              </MetadataListItem>
              <MetadataListItem label="Confidence">
                {o.confidence.toFixed(2)}
              </MetadataListItem>
              <MetadataListItem label="Contact email">
                {o.contactEmail ? (
                  <Link href={`mailto:${o.contactEmail}`}>
                    {o.contactEmail}
                  </Link>
                ) : (
                  "—"
                )}
              </MetadataListItem>
              <MetadataListItem label="Contact phone">
                {formatText(o.contactPhone)}
              </MetadataListItem>
              <MetadataListItem label="Application">
                {o.applicationUrl ? (
                  <Link href={o.applicationUrl} isExternalLink>
                    Open application
                  </Link>
                ) : (
                  "—"
                )}
              </MetadataListItem>
              <MetadataListItem label="Source URL">
                {o.rawUrl ? (
                  <Link href={o.rawUrl} isExternalLink>
                    {o.rawUrl}
                  </Link>
                ) : (
                  "—"
                )}
              </MetadataListItem>
              <MetadataListItem label="Extracted at">
                {formatDate(o.extractedAt)}
              </MetadataListItem>
              <MetadataListItem label="Updated at">
                {formatDate(o.updatedAt)}
              </MetadataListItem>
            </MetadataList>
          </Card>

          <VStack gap={1}>
            <Text type="label">Description</Text>
            <Text type="body">{formatText(o.description)}</Text>
          </VStack>

          {(() => {
            const req = parseJsonField<OpportunityRequirements>(
              o.requirements,
            );
            if (!req) return null;
            return (
              <VStack gap={1}>
                <Text type="label">Requirements</Text>
                <Card padding={6}>
                  <MetadataList columns="multi">
                    <MetadataListItem label="Experience">
                      {formatText(req.experienceLevel)}
                    </MetadataListItem>
                    <MetadataListItem label="Age range">
                      {formatText(req.ageRange)}
                    </MetadataListItem>
                    <MetadataListItem label="Gender">
                      {formatText(req.genderPresentation)}
                    </MetadataListItem>
                    <MetadataListItem label="Languages">
                      {formatList(req.languages)}
                    </MetadataListItem>
                    <MetadataListItem label="Certifications">
                      {formatList(req.certifications)}
                    </MetadataListItem>
                    <MetadataListItem label="Other">
                      {req.other?.length ? (
                        <VStack gap={1}>
                          {req.other.map((item, i) => (
                            <Text key={i} type="body">
                              • {item}
                            </Text>
                          ))}
                        </VStack>
                      ) : (
                        "—"
                      )}
                    </MetadataListItem>
                  </MetadataList>
                </Card>
              </VStack>
            );
          })()}

          {(() => {
            const comp = parseJsonField<OpportunityCompensation>(
              o.compensation,
            );
            if (!comp) return null;
            return (
              <VStack gap={1}>
                <Text type="label">Compensation</Text>
                <HStack gap={2} align="center">
                  <Badge
                    label={comp.isPaid ? "Paid" : "Unpaid"}
                    variant={comp.isPaid ? "success" : "neutral"}
                  />
                  <Text type="body">{formatPay(comp)}</Text>
                </HStack>
              </VStack>
            );
          })()}
        </VStack>
      )}
    />
  );
}
