import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { CreateColumnComponent } from './create-column/create-column.component';
import { BoardColumnComponent } from './board-column/board-column.component';
import { ApiService } from '../../../../../shared/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { Column } from '../../../../../models/column.model';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  moveItemInArray,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { User } from '../../../../../models/user.model';
import { Board } from '../../../../../models/board.model';

@Component({
  selector: 'app-board-columns',
  standalone: true,
  imports: [
    CreateColumnComponent,
    BoardColumnComponent,
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    MatProgressSpinner,
  ],
  templateUrl: './board-columns.component.html',
  styleUrl: './board-columns.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardColumnsComponent implements OnInit {
  boardId!: string;
  board!: Board;
  boardColumns: Column[] = [];
  connectedDropLists: string[] = [];
  isLoading!: boolean;
  currentUser!: User;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.api.getUser().subscribe((res) => {
      this.currentUser = res.user;
      this.cdr.markForCheck();
    });
    this.route.paramMap.subscribe((params) => {
      this.boardId = params.get('boardId')!;

      this.api.getBoard(this.boardId).subscribe((res) => {
        this.board = res.board;
        this.cdr.markForCheck();
      });

      this.api.getColumns(this.boardId).subscribe((res) => {
        this.boardColumns = res.columns;
        this.isLoading = false;
        this.updateConnectedLists();
        this.cdr.markForCheck();
      });
    });
  }

  isBoardMember(): boolean {
    if (!this.board || !this.currentUser) return false;

    return this.board.members.some(
      (member) => (member as unknown as string) === this.currentUser._id,
    );
  }

  addColumn(column: Column) {
    this.boardColumns = [...this.boardColumns, column];
    this.updateConnectedLists();
  }

  deleteColumn(column: Column) {
    this.boardColumns = this.boardColumns.filter((c) => c._id !== column._id);
    this.boardColumns = this.boardColumns.map((c, index) => ({
      ...c,
      order: index + 1,
    }));
    this.updateConnectedLists();
  }

  drop(event: CdkDragDrop<Column[]>) {
    moveItemInArray(this.boardColumns, event.previousIndex, event.currentIndex);

    const column = event.item.data;

    this.api
      .moveColumn(column._id, column.boardId, event.currentIndex)
      .subscribe((res) => {
        this.boardColumns = res.sourceColumns;
      });
  }

  updateColumns(columns: Column[]) {
    this.boardColumns = columns;
  }

  updateConnectedLists() {
    this.connectedDropLists = this.boardColumns.map((c) => c._id);
  }
}
