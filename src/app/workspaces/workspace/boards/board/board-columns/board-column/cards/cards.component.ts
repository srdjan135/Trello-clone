import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Card } from '../../../../../../../models/card.model';
import { ApiService } from '../../../../../../../shared/services/api.service';
import { Column } from '../../../../../../../models/column.model';
import { CardComponent } from './card/card.component';
import { CardService } from '../../../../../../../shared/services/card.service';
import { CdkDrag, DragDropModule } from '@angular/cdk/drag-drop';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CardComponent, CdkDrag, DragDropModule, MatProgressSpinner],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardsComponent implements OnInit {
  @Input({ required: true }) column!: Column;
  cards!: Card[];
  isLoading!: boolean;

  constructor(
    private api: ApiService,
    private cardService: CardService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.cardService.getCards(this.column._id).subscribe((cards) => {
      this.cards = cards;
      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }
}
