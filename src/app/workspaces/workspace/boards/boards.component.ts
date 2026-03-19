import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CreateBoardComponent } from './create-board/create-board.component';
import { Workspace } from '../../../models/workspace';
import { Board } from '../../../models/board.model';
import { ApiService } from '../../../shared/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-boards',
  standalone: true,
  imports: [CreateBoardComponent, RouterLink, MatProgressSpinner],
  templateUrl: './boards.component.html',
  styleUrl: './boards.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardsComponent implements OnChanges, OnInit {
  @Input() workspace!: Workspace;
  @Input() sort: 'az' | 'za' = 'az';
  @Input() search = '';
  boards: Board[] = [];
  sortedBoards: Board[] = [];
  isAdmin!: boolean;
  currentUserId!: string;
  isLoading!: boolean;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workspace'] && this.workspace?._id) {
      this.isLoading = true;
      this.api.getBoards(this.workspace._id).subscribe((res) => {
        this.boards = res.boards;
        this.isLoading = false;
        this.applySortAndSearch();
      });
    }

    if (changes['sort'] || (changes['search'] && this.boards.length)) {
      this.applySortAndSearch();
    }
  }

  ngOnInit(): void {
    const message = sessionStorage.getItem('switchMessage');

    if (message) {
      this.snackBar.open(message, 'Close', {
        duration: 2000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });

      sessionStorage.removeItem('switchMessage');
    }

    this.api.getMyRole(this.workspace._id).subscribe((res) => {
      this.isAdmin = res.role === 'admin';
      this.cdr.markForCheck();
    });

    this.api.getUser().subscribe((res) => {
      this.currentUserId = res.user._id;
      this.cdr.markForCheck();
    });
  }

  get visibleBoards() {
    return this.sortedBoards.filter((board) => {
      if (board.visibility !== 'private') return true;

      return (
        board.members?.some(
          (member) => (member as unknown as string) === this.currentUserId,
        ) ?? false
      );
    });
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
