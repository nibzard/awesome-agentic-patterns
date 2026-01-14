/**
 * Type definitions for the pattern graph visualization
 */

/**
 * Graph node representing a pattern
 */
export interface GraphNode {
  id: string;
  title: string;
  category: string;
  status: string;
  slug: string;
  tags?: string[];
  summary?: string;
  maturity?: string;
  domains?: string[];
  related?: string[];
  anti_patterns?: string[];
}

/**
 * Graph edge representing relationships between patterns
 */
export interface GraphEdge {
  source: string;
  target: string;
  type?: 'related' | 'anti-pattern';
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

/**
 * Complete pattern graph structure
 */
export interface PatternGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Node position in simulation
 */
export interface NodePosition {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

/**
 * Simulation node with position data
 */
export interface SimulationNode extends GraphNode {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

/**
 * Filter options for graph
 */
export interface GraphFilters {
  categories?: string[];
  tags?: string[];
  maturities?: string[];
  domains?: string[];
}
