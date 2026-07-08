'use client';

import { useCallback, useEffect, useState } from 'react';
import { Table } from '@astryxdesign/core/Table';
import type { TableColumn } from '@astryxdesign/core/Table';
import { Pagination } from '@astryxdesign/core/Pagination';
import { VStack } from '@astryxdesign/core/VStack';
import { Heading, Text } from '@astryxdesign/core/Text';
import type { Paginated } from '../lib/api';

const PAGE_SIZE = 20;

interface PaginatedTableProps<T extends Record<string, unknown>> {
  title: string;
  description?: string;
  columns: TableColumn<T>[];
  fetcher: (page: number, itemsPerPage: number) => Promise<Paginated<T>>;
}

export function PaginatedTable<T extends Record<string, unknown>>({
  title,
  description,
  columns,
  fetcher,
}: PaginatedTableProps<T>) {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetcher(targetPage, PAGE_SIZE);
        setRows(result.data ?? []);
        setTotal(result.total ?? 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setRows([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [fetcher],
  );

  useEffect(() => {
    load(page);
  }, [page, load]);

  return (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={3}>{title}</Heading>
        {description ? <Text type="supporting">{description}</Text> : null}
      </VStack>

      {error ? (
        <Text type="body">Could not load data: {error}</Text>
      ) : loading && rows.length === 0 ? (
        <Text type="body">Loading…</Text>
      ) : rows.length === 0 ? (
        <Text type="body">No records found.</Text>
      ) : (
        <Table
          data={rows}
          columns={columns}
          idKey="id"
          hasHover
          textOverflow="truncate"
        />
      )}

      {total > PAGE_SIZE ? (
        <Pagination
          page={page}
          onChange={setPage}
          totalItems={total}
          pageSize={PAGE_SIZE}
          variant="count"
          size="sm"
        />
      ) : null}
    </VStack>
  );
}
