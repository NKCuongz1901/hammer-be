"use client";

import { useParams } from "next/navigation";
import { Card } from "@astryxdesign/core/Card";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
import { Badge } from "@astryxdesign/core/Badge";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { DetailPage } from "../../components/DetailPage";
import { fetchSourceLinkById, type SourceLinkDetail } from "../../lib/api";
import { formatDate, formatLocation, formatText } from "../../lib/format";

const CRAWL_STATUS_VARIANT: Record<string, "success" | "error" | "neutral"> = {
  success: "success",
  failed: "error",
};

export default function SourceLinkDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <DetailPage<SourceLinkDetail>
      id={params.id}
      fetcher={fetchSourceLinkById}
      backHref="/source-links"
      backLabel="Back to source links"
      renderTitle={(s) => s.name}
      render={(s) => (
        <VStack gap={4}>
          <Card padding={6}>
            <MetadataList columns="multi">
              <MetadataListItem label="Category">
                <Badge label={s.category} variant="blue" />
              </MetadataListItem>
              <MetadataListItem label="Source code">
                {formatText(s.sourceCode)}
              </MetadataListItem>
              <MetadataListItem label="URL">
                <Link href={s.url} isExternalLink>
                  {s.url}
                </Link>
              </MetadataListItem>
              <MetadataListItem label="Location">
                {formatLocation(s.city, s.country)}
              </MetadataListItem>
              <MetadataListItem label="Enabled">
                {s.enabled ? (
                  <Badge label="Enabled" variant="success" />
                ) : (
                  <Badge label="Disabled" variant="neutral" />
                )}
              </MetadataListItem>
              <MetadataListItem label="Priority">
                {String(s.priority)}
              </MetadataListItem>
              <MetadataListItem label="Contact type">
                {formatText(s.contactType)}
              </MetadataListItem>
              <MetadataListItem label="Fit">
                {formatText(s.fit)}
              </MetadataListItem>
              <MetadataListItem label="Crawl status">
                {s.crawlStatus ? (
                  <Badge
                    label={s.crawlStatus}
                    variant={CRAWL_STATUS_VARIANT[s.crawlStatus] ?? "neutral"}
                  />
                ) : (
                  "—"
                )}
              </MetadataListItem>
              <MetadataListItem label="Last crawled">
                {formatDate(s.lastCrawledAt)}
              </MetadataListItem>
              <MetadataListItem label="Created at">
                {formatDate(s.createdAt)}
              </MetadataListItem>
              <MetadataListItem label="Updated at">
                {formatDate(s.updatedAt)}
              </MetadataListItem>
            </MetadataList>
          </Card>

          {s.errorMessage ? (
            <VStack gap={1}>
              <Text type="label">Error message</Text>
              <Text type="body">{s.errorMessage}</Text>
            </VStack>
          ) : null}
        </VStack>
      )}
    />
  );
}
