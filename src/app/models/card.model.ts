import { BoardMember } from './boardMember';
import { Label } from './label.model';
export interface Card {
  _id: string;
  title: string;
  columnId: string;
  order: number;
  isComplete?: boolean;
  description?: string;
  labels?: Label[];
  startDate?: Date | null;
  dueDate?: Date | null;
  members?: BoardMember[];
  createdAt?: string;
}
