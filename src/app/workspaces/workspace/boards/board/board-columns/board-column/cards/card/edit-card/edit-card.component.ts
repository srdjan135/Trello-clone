import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  MatDrawerContainer,
  MatDrawer,
  MatDrawerContent,
  MatSidenavModule,
} from '@angular/material/sidenav';
import { CommentsComponent } from './comments/comments.component';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { ModalComponent } from '../../../../../../../../../shared/components/modal/modal.component';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { Card } from '../../../../../../../../../models/card.model';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import {
  FormControl,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
} from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { labels } from './labels';
import { Label } from '../../../../../../../../../models/label.model';
import { ClickStopPropagationDirective } from '../../../../../../../../../shared/directives/click-stop-propagation.directive';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ExampleHeader } from '../../../../../../../../../shared/components/datepicker-header/datepicker-header.component';
import { provideNativeDateAdapter } from '@angular/material/core';
import { BoardMember } from '../../../../../../../../../models/boardMember';
import { ApiService } from '../../../../../../../../../shared/services/api.service';
import { DatePipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-edit-card',
  standalone: true,
  imports: [
    MatDrawerContainer,
    MatDrawer,
    MatDrawerContent,
    CommentsComponent,
    MatSidenavModule,
    MatCheckbox,
    MatIconButton,
    MatIcon,
    MatTooltip,
    ReactiveFormsModule,
    TextFieldModule,
    MatButton,
    MatFormField,
    MatLabel,
    MatInputModule,
    MatMenuModule,
    ClickStopPropagationDirective,
    MatHint,
    MatDatepickerModule,
    FormsModule,
    DatePipe,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './edit-card.component.html',
  styleUrl: './edit-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCardComponent implements OnInit {
  @Input() card!: Card;
  @Input() boardId!: string;

  isDrawerOpen: boolean = false;
  isEditingCardTitle: boolean = false;
  cardTitleCtrl = new FormControl('');
  labels: Label[] = labels;
  exampleHeader = ExampleHeader;
  boardMembers: BoardMember[] = [];
  isDisabledStartDate: boolean = true;
  isDisabledDueDate: boolean = false;
  startDate: Date | null = null;
  dueDate: Date | null = null;
  descCtrl = new FormControl('');

  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.cardTitleCtrl.setValue(this.card.title, { emitEvent: false });
    this.descCtrl.setValue(this.card.description ?? '', { emitEvent: false });

    this.isDisabledStartDate = !this.card.startDate;
    this.startDate = this.card.startDate ?? null;

    this.setDefaultDueDate();

    this.api.getBoardMembers(this.boardId).subscribe((res) => {
      const cardMemberIds = (this.card.members || []).map((m) => m._id);
      this.boardMembers = res.boardMembers.filter(
        (bm) => !cardMemberIds.includes(bm._id),
      );
      this.cdr.markForCheck();
    });

    const updateCardField = (
      control: FormControl,
      field: keyof typeof this.card,
    ) => {
      control.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((value) =>
            this.api
              .updateCard(this.card._id, { [field]: value })
              .pipe(map((res) => ({ res, value }))),
          ),
        )
        .subscribe(({ res, value }) => {
          if (control.value === value) {
            (this.card as any)[field] = res.card[field];
            this.cdr.markForCheck();
          }
        });
    };

    updateCardField(this.cardTitleCtrl, 'title');
    updateCardField(this.descCtrl, 'description');
  }

  toggleDrawer(drawer: MatDrawer) {
    const isOpening = !drawer.opened;
    this.isDrawerOpen = !this.isDrawerOpen;

    if (isOpening) {
      this.dialogRef.updateSize('70%', '65%');
    } else {
      this.dialogRef.updateSize('35%', '65%');
    }

    drawer.toggle();
  }

  markAsComplete(event: MatCheckboxChange) {
    this.card.isComplete = event.checked;
    this.api
      .updateCard(this.card._id, { isComplete: event.checked })
      .subscribe();
  }

  isLabelSelected(label: Label): boolean {
    return (this.card.labels || []).some((l) => l.name === label.name);
  }

  toggleLabel(label: Label) {
    const labels = this.card.labels || [];

    const exists = labels.some((l) => l.name === label.name);

    if (exists) {
      this.card.labels = labels.filter((l) => l.name !== label.name);
    } else {
      this.card.labels = [...labels, label];
    }

    this.updateCardLabels();
  }

  updateCardLabels() {
    this.api
      .updateCard(this.card._id, {
        labels: this.card.labels,
      })
      .subscribe();
  }

  setDefaultDueDate() {
    if (!this.dueDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      this.dueDate = tomorrow;
    }
  }

  toggleStartDate() {
    this.isDisabledStartDate = !this.isDisabledStartDate;

    if (!this.isDisabledStartDate && !this.startDate) {
      const today = new Date();
      this.startDate = today;
    } else {
      this.startDate = null;
    }
  }

  isOverdue(card: Card): boolean {
    if (!card.dueDate) return false;

    const today = this.startOfDay(new Date());
    const due = this.startOfDay(new Date(card.dueDate));

    if (card.startDate) {
      const start = this.startOfDay(new Date(card.startDate));

      if (today < start) return false;

      return today > due;
    }

    return today > due;
  }

  isDueSoon(card: Card): boolean {
    if (!card.dueDate) return false;

    const today = this.startOfDay(new Date());
    const due = this.startOfDay(new Date(card.dueDate));

    if (card.startDate) {
      const start = this.startOfDay(new Date(card.startDate));

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

  updateCardDates(form: NgForm) {
    if (form.invalid) return;

    const dueDate = form.value.dueDate;
    const startDate = form.value.startDate;

    const due = dueDate ? new Date(dueDate) : null;
    const start = startDate ? new Date(startDate) : null;

    if (start && due && due < start) return;

    if (!startDate) {
      this.card.dueDate = dueDate;
      this.card.startDate = null;
      this.api
        .updateCard(this.card._id, { dueDate: dueDate, startDate: null })
        .subscribe();
    } else {
      this.card.startDate = startDate;
      this.card.dueDate = dueDate;
      this.api
        .updateCard(this.card._id, { dueDate: dueDate, startDate: startDate })
        .subscribe();
    }
  }

  resetDates(form: NgForm) {
    this.startDate = null;
    this.isDisabledStartDate = true;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.dueDate = tomorrow;
    this.isDisabledDueDate = false;

    this.card.dueDate = undefined;
    this.card.startDate = undefined;

    form.resetForm({
      startDate: this.startDate,
      dueDate: this.dueDate,
    });

    this.api
      .updateCard(this.card._id, { dueDate: null, startDate: null })
      .subscribe();
  }

  updateCardMembers(boardMember: BoardMember) {
    const members = this.card.members || [];
    this.card.members = [...members, boardMember];
    this.boardMembers = this.boardMembers.filter(
      (m) => m._id !== boardMember._id,
    );

    this.api
      .updateCard(this.card._id, { members: this.card.members })
      .subscribe();
  }

  removeCardMember(cardMember: BoardMember) {
    this.boardMembers = [...this.boardMembers, cardMember];
    this.card.members = this.card.members?.filter(
      (m) => m._id !== cardMember._id,
    );
    const members = this.card.members;

    this.api.updateCard(this.card._id, { members: members }).subscribe();
  }
}
