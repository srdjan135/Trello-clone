import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Card } from '../../../../../../../../models/card.model';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { User } from '../../../../../../../../models/user.model';
import { ApiService } from '../../../../../../../../shared/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { Board } from '../../../../../../../../models/board.model';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../../../../../../../../shared/components/modal/modal.component';
import { EditCardComponent } from './edit-card/edit-card.component';
import { ClickStopPropagationDirective } from '../../../../../../../../shared/directives/click-stop-propagation.directive';
import { MatMenuModule } from '@angular/material/menu';
import { DatePipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BoardMember } from '../../../../../../../../models/boardMember';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { Workspace } from '../../../../../../../../models/workspace';
import { Column } from '../../../../../../../../models/column.model';
import { CardService } from '../../../../../../../../shared/services/card.service';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    MatCheckbox,
    MatIconButton,
    MatIcon,
    MatTooltip,
    ClickStopPropagationDirective,
    MatMenuModule,
    DatePipe,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    ReactiveFormsModule,
    MatButton,
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent implements OnInit {
  @Input({ required: true }) card!: Card;

  currentUser!: User;
  workspaceId!: string;
  workspaces: Workspace[] = [];
  boardId!: string;
  board!: Board;
  boardMembers: BoardMember[] = [];
  isCompleteCtrl = new FormControl(false);
  selectedBoardColumns: Column[] = [];
  positions: number[] = [];

  form!: FormGroup;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private cardService: CardService,
  ) {}

  ngOnInit(): void {
    this.isCompleteCtrl.setValue(this.card.isComplete!, { emitEvent: false });

    this.api.getUser().subscribe((res) => {
      this.currentUser = res.user;
      this.cdr.markForCheck();
    });

    this.api.gePopulateWorkspaces().subscribe((res) => {
      this.workspaces = res.workspaces;
      this.cdr.markForCheck();
    });

    this.route.paramMap.subscribe((params) => {
      this.boardId = params.get('boardId')!;

      this.form = new FormGroup({
        title: new FormControl(this.card.title, Validators.required),
        keepLabels: new FormControl(true),
        boardId: new FormControl(this.boardId, Validators.required),
        columnId: new FormControl(this.card.columnId, Validators.required),
        position: new FormControl(1, Validators.required),
      });

      this.api.getColumns(this.boardId).subscribe((res) => {
        this.selectedBoardColumns = res.columns;
        this.cdr.markForCheck();
      });

      this.form.get('boardId')?.valueChanges.subscribe((boardId) => {
        this.api.getColumns(boardId).subscribe((res) => {
          this.selectedBoardColumns = res.columns;

          this.form.patchValue({
            column: null,
            position: null,
          });

          this.positions = [];

          this.cdr.markForCheck();
        });
      });

      if (this.card.columnId) {
        this.api.getCards(this.card.columnId).subscribe((res) => {
          const count = res.cards.length;
          this.positions = Array.from({ length: count + 1 }, (_, i) => i + 1);
          this.cdr.markForCheck();
        });
      }

      this.form.get('columnId')?.valueChanges.subscribe((columnId) => {
        if (!columnId) return;

        this.api.getCards(columnId).subscribe((res) => {
          const count = res.cards.length;

          this.positions = Array.from({ length: count + 1 }, (_, i) => i + 1);

          this.cdr.markForCheck();
        });
      });

      this.api.getBoard(this.boardId).subscribe((res) => {
        this.board = res.board;
        this.cdr.markForCheck();
      });

      this.api.getBoardMembers(this.boardId).subscribe((res) => {
        this.boardMembers = res.boardMembers;
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

  submit() {
    if (this.form.invalid) return;

    const boardId = this.form.value.boardId;
    const columnId = this.form.value.columnId;
    const position = this.form.value.position;
    const title = this.form.value.title;
    const keepLabels = this.form.value.keepLabels;

    this.api
      .copyCard(this.card._id, {
        boardId,
        columnId,
        position,
        title,
        keepLabels,
      })
      .subscribe((res) => {
        const targetColumn = this.selectedBoardColumns.find(
          (c) => c._id === columnId,
        );

        if (!targetColumn) return;

        const pos = position - 1;

        const updatedCards = [...(targetColumn.cards || [])];

        updatedCards.splice(pos, 0, res.card._id as any);

        targetColumn.cards = updatedCards;
      });
  }

  markAsComplete(event: MatCheckboxChange) {
    this.card.isComplete = event.checked;
    this.api
      .updateCard(this.card._id, { isComplete: event.checked })
      .subscribe();
  }

  isOverdue(): boolean {
    if (!this.card.dueDate) return false;

    const today = this.startOfDay(new Date());
    const due = this.startOfDay(new Date(this.card.dueDate));

    if (this.card.startDate) {
      const start = this.startOfDay(new Date(this.card.startDate));

      if (today < start) return false;

      return today > due;
    }

    return today > due;
  }

  isDueSoon(): boolean {
    if (!this.card.dueDate) return false;

    const today = this.startOfDay(new Date());
    const due = this.startOfDay(new Date(this.card.dueDate));

    if (this.card.startDate) {
      const start = this.startOfDay(new Date(this.card.startDate));

      if (today < start) return false;
    }

    const diffInDays =
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    return diffInDays >= 0 && diffInDays <= 1;
  }

  startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  isAlreadyJoined() {
    if (!this.currentUser || !this.card.members) return false;

    return this.card.members.find((m) => m?.user?._id === this.currentUser._id);
  }

  joinToCard() {
    if (this.isAlreadyJoined()) return;

    const boardMember = this.boardMembers.find(
      (m) => m.user._id === this.currentUser._id,
    );

    this.card.members = [...this.card.members!, boardMember!];

    this.api
      .updateCard(this.card._id, { members: this.card.members })
      .subscribe();
  }

  leaveFromCard() {
    if (!this.isAlreadyJoined()) return;

    this.card.members = this.card.members!.filter(
      (m) => m.user._id !== this.currentUser._id,
    );

    this.api
      .updateCard(this.card._id, { members: this.card.members })
      .subscribe();
  }

  deleteCard() {
    this.api.deleteCard(this.card._id).subscribe((res) => {
      this.cardService.deleteCard(this.card.columnId, res.card._id);
    });
  }

  openEditCardModal() {
    this.dialog.open(ModalComponent, {
      width: '70%',
      maxWidth: '100vw',
      height: '65%',
      data: {
        title: 'Edit Card',
        component: EditCardComponent,
        data: {
          card: this.card,
          boardId: this.boardId,
        },
      },
    });
  }
}
