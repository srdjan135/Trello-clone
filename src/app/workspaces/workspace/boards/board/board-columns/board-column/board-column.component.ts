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
import {
  debounceTime,
  distinctUntilChanged,
  Observable,
  switchMap,
} from 'rxjs';
import { ApiService } from '../../../../../../shared/services/api.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { Workspace } from '../../../../../../models/workspace';
import { Board } from '../../../../../../models/board.model';
import { ActivatedRoute } from '@angular/router';
import { CreateCardComponent } from './cards/create-card/create-card.component';
import { CardsComponent } from './cards/cards.component';
import {
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Card } from '../../../../../../models/card.model';
import { CardService } from '../../../../../../shared/services/card.service';
import { AsyncPipe } from '@angular/common';
import { MatInput } from '@angular/material/input';

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
    CreateCardComponent,
    CardsComponent,
    CdkDropList,
    AsyncPipe,
    MatInput,
  ],
  templateUrl: './board-column.component.html',
  styleUrl: './board-column.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardColumnComponent implements OnInit {
  @Input({ required: true }) column!: Column;
  @Input() connectedDropLists!: string[];
  @Input({ required: true }) columns!: Column[];
  @Output() columnsChanged = new EventEmitter<Column[]>();
  @Output() addCopiedColumn = new EventEmitter<Column>();

  workspaces!: Workspace[];
  isEditingColumnTitle: boolean = false;
  isAddingCard: boolean = false;
  columnTitle = new FormControl('');
  copyColumnTitle = new FormControl('');
  moveToBoardCtrl = new FormControl();
  moveToPositionCtrl = new FormControl();
  positions: number[] = [];
  selectedBoard!: Board;
  boardId!: string;
  cards$!: Observable<Card[]>;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private cardService: CardService,
  ) {}

  ngOnInit(): void {
    this.cards$ = this.cardService.getCards(this.column._id);
    this.api.getCards(this.column._id).subscribe((res) => {
      this.cardService.setCards(this.column._id, res.cards);
      this.cdr.markForCheck();
    });
    this.columnTitle.setValue(this.column.title, { emitEvent: false });
    this.copyColumnTitle.setValue(this.columnTitle.value, { emitEvent: false });
    const columnPosition =
      this.columns.findIndex((c) => c._id === this.column._id) + 1;
    const count = this.columns.length;
    this.positions = Array.from({ length: count }, (_, i) => i + 1);
    this.moveToPositionCtrl.setValue(columnPosition);

    this.cdr.markForCheck();
    this.route.paramMap.subscribe((params) => {
      this.boardId = params.get('boardId')!;
      this.moveToBoardCtrl.setValue(this.boardId);
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

  copyColumn() {
    if (!this.copyColumnTitle.value) return;

    const copyColumnTitle = this.copyColumnTitle.value;

    this.api
      .copyColumn(this.boardId, this.column._id, copyColumnTitle)
      .subscribe((res) => {
        this.addCopiedColumn.emit(res.copiedColumn);
      });
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

  sortCards(type: string) {
    const cards = [...this.cardService.getCardsSnapshot(this.column._id)];

    if (!cards.length) return;

    if (type === 'newest') {
      cards.sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
      );
    }

    if (type === 'oldest') {
      cards.sort(
        (a, b) =>
          new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime(),
      );
    }

    if (type === 'alphabetical') {
      cards.sort((a, b) => a.title.localeCompare(b.title));
    }

    const updatedCards = cards.map((card, index) => ({
      ...card,
      order: index,
    }));

    this.cardService.setCards(this.column._id, updatedCards);

    this.api.sortCards(updatedCards).subscribe();
  }

  drop(event: CdkDragDrop<Card[]>) {
    const card = event.item.data;
    if (!card) return;

    const previousCards = [...event.previousContainer.data];
    const currentCards = [...event.container.data];

    if (event.previousContainer === event.container) {
      moveItemInArray(currentCards, event.previousIndex, event.currentIndex);

      this.cardService.setCards(event.container.id, currentCards);
    } else {
      transferArrayItem(
        previousCards,
        currentCards,
        event.previousIndex,
        event.currentIndex,
      );

      this.cardService.setCards(event.previousContainer.id, previousCards);
      this.cardService.setCards(event.container.id, currentCards);
    }

    this.api
      .moveCard(event.container.id, card._id, event.currentIndex)
      .subscribe();
  }
}
