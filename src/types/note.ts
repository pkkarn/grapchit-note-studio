export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  backlinks: string[];
  forward_links: string[];
}

export interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
