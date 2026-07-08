import { END, START, StateGraph } from '@langchain/langgraph';
import {
  AgentsState,
  AgentsStateType,
  AgentsStateUpdate,
} from './agents.state';

type Node = (
  state: AgentsStateType,
) => Promise<AgentsStateUpdate> | AgentsStateUpdate;

export function buildAgentsGraph(nodes: {
  importCsvNode: Node;
  crawlSourcesNode: Node;
  extractOpportunitiesNode: Node;
  matchOpportunitiesNode: Node;
}) {
  return new StateGraph(AgentsState)
    .addNode('importCsv', nodes.importCsvNode)
    .addNode('crawlSources', nodes.crawlSourcesNode)
    .addNode('extractOpportunities', nodes.extractOpportunitiesNode)
    .addNode('matchOpportunities', nodes.matchOpportunitiesNode)

    .addEdge(START, 'importCsv')
    .addEdge('importCsv', 'crawlSources')
    .addEdge('crawlSources', 'extractOpportunities')
    .addEdge('extractOpportunities', 'matchOpportunities')
    .addEdge('matchOpportunities', END)
    .compile();
}
