import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Issue } from '../../../data/issuesDetailsScreenData';

export interface IssueState {
  issues: Issue[];
  isEditingDescription: boolean;
}

const initialState: IssueState = {
  issues: [],
  isEditingDescription: false,
};

interface SetDescriptionPayload {
  issueId: string;
  description: string;
}

const issueSlice = createSlice({
  name: 'issue',
  initialState,
  reducers: {
    setIssues: (state, action: PayloadAction<Issue[]>) => {
      state.issues = action.payload;
    },
    setDescription: (state, action: PayloadAction<SetDescriptionPayload>) => {
      const { issueId, description } = action.payload;
      const formattedDescription = description
        .trim()
        .replace(/[ \t]+/g, ' ')
        .replace(/ *\n */g, '\n')
        .replace(/\n{3,}/g, '\n\n');

      const issue = state.issues.find(item => item.id === issueId);
      if (issue) {
        issue.description = formattedDescription;
      }
    },
    setIsEditingDescription: (state, action: PayloadAction<boolean>) => {
      state.isEditingDescription = action.payload;
    },
  },
});

export const { setIssues, setDescription, setIsEditingDescription } =
  issueSlice.actions;

export default issueSlice.reducer;
