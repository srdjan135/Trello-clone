import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Board } from '../../../../models/board.model';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../shared/services/api.service';
import { KanbanHeaderComponent } from './kanban-header/kanban-header.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [KanbanHeaderComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent implements OnInit {
  boardId!: string;
  board!: Board;
  selectedBackground!: string;

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.boardId = params.get('boardId')!;

      this.api.getBoard(this.boardId).subscribe((res) => {
        this.board = res.board;
        this.selectedBackground = res.board?.background;
        this.cdr.markForCheck();
      });
    });
  }
}
