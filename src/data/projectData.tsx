import { ThemeColors } from '../constants/Colors';

export interface Project {
  id: string;
  name: string;
  code: string;
  type: string;
  category: string;
  issues: number;
  color: string;
  starred: boolean;
}

export const getProjects = (colors: ThemeColors): Project[] => [
  {
    id: '1',
    name: 'Cloud Migration',
    code: 'CM',
    type: 'CLOUD',
    category: 'Software',
    issues: 142,
    color: colors.primary,
    starred: true,
  },
  {
    id: '2',
    name: 'Mobile App v3',
    code: 'MA',
    type: 'MOB',
    category: 'Software',
    issues: 89,
    color: colors.secondary || colors.primary,
    starred: true,
  },
  {
    id: '3',
    name: 'API Gateway',
    code: 'AG',
    type: 'API',
    category: 'Software',
    issues: 56,
    color: colors.warning || colors.primary,
    starred: false,
  },
  {
    id: '4',
    name: 'Design System',
    code: 'DS',
    type: 'DS',
    category: 'Business',
    issues: 34,
    color: colors.success || colors.primary,
    starred: false,
  },
  {
    id: '5',
    name: 'Security Audit',
    code: 'SA',
    type: 'SEC',
    category: 'Software',
    issues: 28,
    color: colors.info || colors.primary,
    starred: false,
  },
  {
    id: '6',
    name: 'Data Pipeline',
    code: 'DP',
    type: 'DATA',
    category: 'Software',
    issues: 67,
    color: colors.warning || colors.primary,
    starred: false,
  },
  {
    id: '7',
    name: 'DevOps Platform',
    code: 'DP',
    type: 'OPS',
    category: 'Software',
    issues: 112,
    color: colors.primary,
    starred: false,
  },
];
