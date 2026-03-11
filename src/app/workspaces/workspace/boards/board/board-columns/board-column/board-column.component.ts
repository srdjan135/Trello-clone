import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../../../../../../shared/directives/click-outside.directive';
import { MatMenuModule } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { Column } from '../../../../../../models/column.model';
import { ClickStopPropagationDirective } from '../../../../../../shared/directives/click-stop-propagation.directive';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ApiService } from '../../../../../../shared/services/api.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { Workspace } from '../../../../../../models/workspace';
import { Board } from '../../../../../../models/board.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-board-column',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ClickOutsideDirective,
    MatMenuModule,
    MatIcon,
    MatIconButton,
    MatButton,
    ClickStopPropagationDirective,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
  ],
  templateUrl: './board-column.component.html',
  styleUrl: './board-column.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardColumnComponent implements OnInit {
  @Input({ required: true }) column!: Column;
  @Input({ required: true }) columns!: Column[];
  @Output() columnsChanged = new EventEmitter<Column[]>();
  workspaces!: Workspace[];

  isEditingColumnTitle: boolean = false;
  columnTitle = new FormControl('');
  moveToBoardCtrl = new FormControl();
  moveToPositionCtrl = new FormControl();
  positions: number[] = [];
  selectedBoard!: Board;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.columnTitle.setValue(this.column.title, { emitEvent: false });
    const columnPosition =
      this.columns.findIndex((c) => c._id === this.column._id) + 1;
    const count = this.columns.length;
    this.positions = Array.from({ length: count }, (_, i) => i + 1);
    this.moveToPositionCtrl.setValue(columnPosition);

    this.cdr.markForCheck();
    this.route.paramMap.subscribe((params) => {
      const boardId = params.get('boardId')!;
      this.moveToBoardCtrl.setValue(boardId);
    });
    this.api.gePopulateWorkspaces().subscribe((res) => {
      this.workspaces = res.workspaces;
      this.cdr.markForCheck();
    });
    this.columnTitle.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((value) =>
          this.api.updateColumn(this.column._id, {
            title: value as string,
          }),
        ),
      )
      .subscribe((res) => {
        this.columnTitle.setValue(res.column.title, { emitEvent: false });
        this.cdr.markForCheck();
      });
  }

  onBoardChange(boardId: string) {
    const board = this.workspaces
      .flatMap((w) => w.boards!)
      .find((b) => b._id === boardId);

    if (!board) return;

    const count = board.columns?.length ?? 0;
    this.positions = Array.from({ length: count + 1 }, (_, i) => i + 1);
  }

  moveColumn() {
    const boardId = this.moveToBoardCtrl.value;
    const position = this.moveToPositionCtrl.value;

    this.api
      .moveColumn(this.column._id, boardId, position - 1)
      .subscribe((res) => {
        this.columnsChanged.emit(res.sourceColumns);
      });
  }
}
