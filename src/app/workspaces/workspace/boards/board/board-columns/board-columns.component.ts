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
import { tap, switchMap, forkJoin } from 'rxjs';

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

    this.api
      .getUser()
      .pipe(
        tap((res) => (this.currentUser = res.user)),
        switchMap(() => this.route.paramMap),
        switchMap((params) => {
          this.boardId = params.get('boardId')!;
          return forkJoin({
            boardRes: this.api.getBoard(this.boardId),
            columnsRes: this.api.getColumns(this.boardId),
          });
        }),
      )
      .subscribe(({ boardRes, columnsRes }) => {
        this.board = boardRes.board;
        this.boardColumns = columnsRes.columns;
        this.updateConnectedLists();
        this.isLoading = false;
        this.cdr.markForCheck();
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
