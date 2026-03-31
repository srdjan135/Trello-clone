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
import { FilterService } from '../../../../../../../shared/services/filter.service';
import { User } from '../../../../../../../models/user.model';
import { combineLatest, forkJoin, merge, switchMap, tap } from 'rxjs';

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
  filteredCards: Card[] = [];
  isLoading!: boolean;
  currentUser!: User;

  constructor(
    private api: ApiService,
    private cardService: CardService,
    private cdr: ChangeDetectorRef,
    private filterService: FilterService,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    combineLatest([
      this.api.getUser(),
      this.cardService.getCards(this.column._id),
    ])
      .pipe(
        tap(([userRes, cards]) => {
          this.currentUser = userRes.user;
          this.cards = cards;
          this.applyFilters(this.filterService.getFilters());
        }),
        switchMap(() =>
          merge(
            this.filterService.filters$.pipe(
              tap((filters) => this.applyFilters(filters)),
            ),
            this.api.cardUpdated.pipe(
              tap((updatedCard) => {
                const index = this.cards.findIndex(
                  (c) => c._id === updatedCard._id,
                );
                if (index !== -1) {
                  this.cards[index] = updatedCard;
                  this.applyFilters(this.filterService.getFilters());
                }
              }),
            ),
          ),
        ),
      )
      .subscribe({
        next: () => {
          this.cdr.markForCheck();
          this.isLoading = false;
        },
      });
  }
  get hasActiveFilters(): boolean {
    const filters = this.filterService.getFilters();
    return Object.values(filters || {}).some((arr: any) => arr?.length);
  }

  applyFilters(filters: any) {
    if (!this.cards) return;

    const now = new Date();

    const hasActiveFilters = Object.values(filters || {}).some(
      (arr: any) => arr?.length,
    );

    if (!hasActiveFilters) {
      this.filteredCards = [...this.cards];
      return;
    }

    this.filteredCards = this.cards.filter((card) => {
      // ---------------- MEMBERS ----------------
      if (filters.members?.length) {
        const match = filters.members.some((f: any) => {
          if (f.value === 'No members') {
            return !card.members || card.members.length === 0;
          }

          if (f.value === 'Card assigned to me') {
            return card.members?.some(
              (m: any) => m.user?._id === this.currentUser?._id,
            );
          }

          return false;
        });

        if (!match) return false;
      }

      // ---------------- STATUS ----------------
      if (filters.cardStatus?.length) {
        const match = filters.cardStatus.some((f: any) => {
          if (f.value === 'Marked as complete') {
            return card.isComplete === true;
          }

          if (f.value === 'Not marked as complete') {
            return !card.isComplete;
          }

          return false;
        });

        if (!match) return false;
      }

      // ---------------- DUE DATE ----------------
      if (filters.dueDate?.length) {
        const match = filters.dueDate.some((f: any) => {
          const due = card.dueDate ? new Date(card.dueDate) : null;

          if (f.value === 'No dates') {
            return !due;
          }

          if (!due) return false;

          const diffTime = due.getTime() - now.getTime();
          const diffDays = diffTime / (1000 * 3600 * 24);

          if (f.value === 'Overdue') {
            return due < now;
          }

          if (f.value === 'Due in the next day') {
            return diffDays >= 0 && diffDays <= 1;
          }

          if (f.value === 'Due in the next week') {
            return diffDays >= 0 && diffDays <= 7;
          }

          if (f.value === 'Due in the next month') {
            return diffDays >= 0 && diffDays <= 30;
          }

          return false;
        });

        if (!match) return false;
      }

      // ---------------- LABELS ----------------
      if (filters.labels?.length) {
        const match = filters.labels.some((f: any) => {
          if (f.value === 'No labels') {
            return !card.labels || card.labels.length === 0;
          }

          if (f.color) {
            return card.labels?.some((l) => l.color === f.color);
          }

          return false;
        });

        if (!match) return false;
      }

      return true;
    });
  }
}
