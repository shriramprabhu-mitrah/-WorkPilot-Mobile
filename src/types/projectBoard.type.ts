export interface BoardCard {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface BoardColumn {
  id: string;
  title: string;
  color?: string;
  cards: BoardCard[];
}

export interface ProjectBoard {
  projectId: string;
  columns: BoardColumn[];
}
