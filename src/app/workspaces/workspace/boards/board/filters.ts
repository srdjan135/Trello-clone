export interface FilterOption {
  icon?: string;
  filterValue?: string;
  labelColor?: string;
}

export interface Filters {
  members: FilterOption[];
  cardStatus: FilterOption[];
  dueDate: FilterOption[];
  labels: FilterOption[];
}

export const filters: Filters = {
  members: [
    { icon: '', filterValue: 'No members' },
    {
      icon: '',
      filterValue: 'Card assigned to me',
    },
  ],
  cardStatus: [
    { icon: '', filterValue: 'Marked as complete' },
    { icon: '', filterValue: 'Not marked as complete' },
  ],
  dueDate: [
    { icon: '', filterValue: 'No dates' },
    { icon: '', filterValue: 'Overdue' },
    { icon: '', filterValue: 'Due in the next day' },
    { icon: '', filterValue: 'Due in the next week' },
    { icon: '', filterValue: 'Due in the next month' },
  ],
  labels: [
    { icon: '', filterValue: 'No labels' },
    { labelColor: '#4bce97' },
    { labelColor: '#eed12b' },
    { labelColor: '#fca700' },
    { labelColor: '#ce544b' },
    { labelColor: '#4b6ace' },
  ],
};
