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

@Component({
  selector: 'app-board-columns',
  standalone: true,
  imports: [
    CreateColumnComponent,
    BoardColumnComponent,
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
  ],
  templateUrl: './board-columns.component.html',
  styleUrl: './board-columns.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardColumnsComponent implements OnInit {
  boardId!: string;
  boardColumns: Column[] = [];
  connectedDropLists: string[] = [];

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.boardId = params.get('boardId')!;
      this.api.getColumns(this.boardId).subscribe((res) => {
        this.boardColumns = res.columns;
        this.updateConnectedLists();
        this.cdr.markForCheck();
      });
    });
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
