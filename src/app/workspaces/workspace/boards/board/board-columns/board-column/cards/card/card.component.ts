import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Card } from '../../../../../../../../models/card.model';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { User } from '../../../../../../../../models/user.model';
import { ApiService } from '../../../../../../../../shared/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { Board } from '../../../../../../../../models/board.model';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [MatCheckbox, MatIconButton, MatIcon, MatTooltip],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent implements OnInit {
  @Input({ required: true }) card!: Card;

  currentUser!: User;
  boardId!: string;
  board!: Board;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
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
    });
  }

  isBoardMember(): boolean {
    if (!this.board || !this.currentUser) return false;

    return this.board.members.some(
      (member) => (member as unknown as string) === this.currentUser._id,
    );
  }
}
