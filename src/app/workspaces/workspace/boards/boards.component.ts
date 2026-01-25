import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { CreateBoardComponent } from './create-board/create-board.component';
import { Workspace } from '../../../models/workspace';
import { Board } from '../../../models/board.model';
import { ApiService } from '../../../shared/services/api.service';

@Component({
  selector: 'app-boards',
  standalone: true,
  imports: [CreateBoardComponent],
  templateUrl: './boards.component.html',
  styleUrl: './boards.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardsComponent implements OnInit {
  @Input({ required: true }) workspace!: Workspace;
  boards: Board[] = [];

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.api.getBoards(this.workspace._id).subscribe((res) => {
      this.boards = res.boards;
      this.cdr.markForCheck();
    });
  }

  updateBoardsList(newBoard: Board) {
    this.boards.push(newBoard);
  }
}
