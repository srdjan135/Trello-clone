import { Card } from './card.model';

export interface Column {
  _id: string;
  title: string;
  boardId: string;
  order: number;
  cards?: Card[];
}
