import { User } from './user.model';

export interface Comment {
  _id: string;
  user: User;
  content: string;
  cardId: string;
  createdAt: string;
}
