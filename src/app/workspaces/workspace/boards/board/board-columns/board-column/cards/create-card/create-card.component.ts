import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../../../../../../shared/services/api.service';
import { Column } from '../../../../../../../../models/column.model';
import { CardService } from '../../../../../../../../shared/services/card.service';

@Component({
  selector: 'app-create-card',
  standalone: true,
  imports: [MatIconButton, MatIcon, MatButton, ReactiveFormsModule],
  templateUrl: './create-card.component.html',
  styleUrl: './create-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCardComponent {
  @Input({ required: true }) column!: Column;
  @Input({ required: true }) isAddingCard!: boolean;
  @Output() isAddingCardChange = new EventEmitter<boolean>();

  cardTitleCtrl = new FormControl('');

  constructor(
    private api: ApiService,
    private cardService: CardService,
    private cdr: ChangeDetectorRef,
  ) {}

  createCard() {
    if (!this.cardTitleCtrl.value) return;

    const cardTitle = this.cardTitleCtrl.value;
    this.api.createCard(cardTitle, this.column._id).subscribe((res) => {
      this.cardService.addCard(this.column._id, res.card);
      this.cardTitleCtrl.setValue('');
      this.cdr.markForCheck();
    });
  }
}
