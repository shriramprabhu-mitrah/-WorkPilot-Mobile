export interface ViewedItem {
  id: string;
  title: string;
  type: string;
  category: string;
  key?: string;
  projectName?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  type: string;
  key: string;
  projectName: string;
  action: string;
  user: {
    name: string;
    avatarInitial: string;
  };
  formattedDate: string;
}

export interface ShortcutItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  type: string;
}
