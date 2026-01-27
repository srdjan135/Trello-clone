import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
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
export class BoardsComponent implements OnChanges {
  @Input() workspace!: Workspace;
  @Input() sort: 'az' | 'za' = 'az';
  @Input() search = '';
  boards: Board[] = [];
  sortedBoards: Board[] = [];

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workspace'] && this.workspace?._id) {
      this.api.getBoards(this.workspace._id).subscribe((res) => {
        this.boards = res.boards;
        this.applySortAndSearch();
      });
    }

    if (changes['sort'] || (changes['search'] && this.boards.length)) {
      this.applySortAndSearch();
    }
  }

  updateBoardsList(newBoard: Board) {
    this.boards.push(newBoard);
    this.applySortAndSearch();
  }

  private applySortAndSearch() {
    const searchValue = this.search.toLowerCase().trim();

    let result = [...this.boards];

    if (searchValue) {
      result = result.filter((b) =>
        b.title.toLowerCase().includes(searchValue),
      );
    }

    result.sort(this.sort === 'az' ? this.sortAZ : this.sortZA);

    this.sortedBoards = result;
    this.cdr.markForCheck();
  }

  private sortAZ(a: Board, b: Board) {
    return a.title.localeCompare(b.title);
  }

  private sortZA(a: Board, b: Board) {
    return b.title.localeCompare(a.title);
  }
}
