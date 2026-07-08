import { Annotation } from '@langchain/langgraph';
export const AgentsState = Annotation.Root({
  csvPath: Annotation<string>(),

  limit: Annotation<number | undefined>({
    value: (prev, next) => next ?? prev,
    default: () => undefined,
  }),

  sourceIds: Annotation<string[]>({
    reducer: (current, update) => current.concat(update),
    default: () => [],
  }),

  rawPageIds: Annotation<string[]>({
    reducer: (current, update) => current.concat(update),
    default: () => [],
  }),

  opportunityIds: Annotation<string[]>({
    reducer: (current, update) => current.concat(update),
    default: () => [],
  }),

  recommendationIds: Annotation<string[]>({
    reducer: (current, update) => current.concat(update),
    default: () => [],
  }),

  logs: Annotation<string[]>({
    reducer: (current, update) => current.concat(update),
    default: () => [],
  }),

  errors: Annotation<string[]>({
    reducer: (current, update) => current.concat(update),
    default: () => [],
  }),
});

export type AgentsStateType = typeof AgentsState.State;
export type AgentsStateUpdate = typeof AgentsState.Update;
