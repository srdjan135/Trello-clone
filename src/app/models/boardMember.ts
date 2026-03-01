export interface BoardMember {
  _id: string;
  role: 'admin' | 'member';
  boardId: string;
  user: {
    _id: string;
    username: string;
    email?: string;
  };
}
