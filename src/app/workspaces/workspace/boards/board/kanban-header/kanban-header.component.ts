import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  ViewChild,
} from '@angular/core';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { AvatarComponent } from '../../../../../shared/components/avatar/avatar.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatDivider } from '@angular/material/divider';
import { MatSelect, MatOption } from '@angular/material/select';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { filters, Filters } from '../filters';
import { User } from '../../../../../models/user.model';
import { BoardMember } from '../../../../../models/boardMember';
import { Workspace } from '../../../../../models/workspace';
import {
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { Board } from '../../../../../models/board.model';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../../../shared/services/api.service';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { InviteBoardMembersComponent } from '../invite-board-members/invite-board-members.component';
import { MatTooltip } from '@angular/material/tooltip';
import { bgColorImages, bgImages } from '../../create-board/images';
import { MatButton, MatIconButton } from '@angular/material/button';
import { ClickStopPropagationDirective } from '../../../../../shared/directives/click-stop-propagation.directive';
import { MatInput } from '@angular/material/input';
import { ClickOutsideDirective } from '../../../../../shared/directives/click-outside.directive';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { WorkspaceMember } from '../../../../../models/workspaceMember';
import { FilterService } from '../../../../../shared/services/filter.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-kanban-header',
  standalone: true,
  imports: [
    MatMenu,
    MatMenuItem,
    AvatarComponent,
    MatCheckbox,
    MatIcon,
    MatFormField,
    MatInput,
    MatDivider,
    MatLabel,
    MatSelect,
    MatOption,
    ReactiveFormsModule,
    MatTooltip,
    MatMenuTrigger,
    MatButton,
    MatIconButton,
    ClickStopPropagationDirective,
    RouterLink,
    ClickOutsideDirective,
    MatProgressSpinner,
  ],
  templateUrl: './kanban-header.component.html',
  styleUrl: './kanban-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanHeaderComponent {
  @Output() selectedBgChange = new EventEmitter<string>();

  user!: User;
  workspaceId!: string;
  workspaces!: Workspace[];
  workspaceMembers!: WorkspaceMember[];
  boardId!: string;
  board!: Board;
  boardMembers!: BoardMember[];
  selectedVisibility: 'private' | 'workspace' | 'public' = 'private';
  isEditBoardTitle: boolean = false;
  isAbout: boolean = false;
  filters: Filters = filters;
  filterKeys = Object.keys(this.filters) as (keyof Filters)[];
  boardTitle = new FormControl('');
  descriptionCtrl = new FormControl('');
  boardWorkspaceCtrl = new FormControl('');
  copyBoardTitle = new FormControl('');
  copyBoardWorkspaceCtrl = new FormControl('');
  keepCardsCtrl = new FormControl(false);
  bgColorImages: string[] = bgColorImages;
  bgImages: string[] = bgImages;
  selectedBg!: string;
  isLoading!: boolean;
  selectedFilters: any = {};

  sectionTitles: Record<keyof Filters, string> = {
    members: 'Members',
    cardStatus: 'Card Status',
    dueDate: 'Due Date',
    labels: 'Labels',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private api: ApiService,
    private dialog: MatDialog,
    private filterService: FilterService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit() {
    this.isLoading = true;

    const route$ = this.route.paramMap.pipe(
      map((params) => ({
        boardId: params.get('boardId')!,
        workspaceId: params.get('workspaceId')!,
      })),
    );

    route$
      .pipe(
        tap(({ boardId, workspaceId }) => {
          this.boardId = boardId;
          this.workspaceId = workspaceId;
        }),
        switchMap(({ boardId, workspaceId }) =>
          combineLatest({
            board: this.api.getBoard(boardId).pipe(catchError(() => of(null))),
            boardMembers: this.api
              .getBoardMembers(boardId)
              .pipe(
                catchError(() =>
                  of({ boardMembers: [] } as { boardMembers: BoardMember[] }),
                ),
              ),
            workspaceMembers: this.api
              .getWorkspaceMembers(workspaceId)
              .pipe(catchError(() => of([]))),
          }),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(
        ({ board, boardMembers: boardMembersObj, workspaceMembers }) => {
          if (board) {
            this.board = board.board;
            this.selectedVisibility = board.board.visibility;
            this.selectedBg = board.board.background;
            this.selectedBgChange.emit(board.board.background);
            this.boardTitle.setValue(board.board.title, { emitEvent: false });
            this.descriptionCtrl.setValue(board.board.description ?? '', {
              emitEvent: false,
            });

            if (typeof board.board.workspace !== 'string') {
              this.boardWorkspaceCtrl.setValue(board.board.workspace.name, {
                emitEvent: false,
              });
              this.copyBoardWorkspaceCtrl.setValue(board.board.workspace.name, {
                emitEvent: false,
              });
            }
          }

          this.boardMembers = boardMembersObj?.boardMembers || [];
          this.workspaceMembers = workspaceMembers || [];

          this.isLoading = false;
          this.cdr.markForCheck();
        },
      );

    this.descriptionCtrl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) =>
          this.api
            .updateBoard(this.boardId, { description: value as string })
            .pipe(map((res) => ({ res, value }))),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ res, value }) => {
        if (this.descriptionCtrl.value === value) {
          this.board.description = res.board.description;
          this.cdr.markForCheck();
        }
      });

    this.boardTitle.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) =>
          this.api
            .updateBoard(this.boardId, { title: value as string })
            .pipe(map((res) => ({ res, value }))),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ res, value }) => {
        if (this.boardTitle.value === value) {
          this.board.title = res.board.title;
          this.cdr.markForCheck();
        }
      });

    combineLatest({
      user: this.api.getUser().pipe(catchError(() => of(null))),
      workspaces: this.api
        .getWorkspaces()
        .pipe(
          catchError(() =>
            of({ workspaces: [] } as { workspaces: Workspace[] }),
          ),
        ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ user, workspaces }) => {
        this.user = user?.user!;
        this.workspaces = workspaces?.workspaces || [];
        this.cdr.markForCheck();
      });
  }

  onFilterChange(key: string, option: any, checked: boolean) {
    if (!this.selectedFilters[key]) {
      this.selectedFilters[key] = [];
    }

    if (checked) {
      this.selectedFilters[key].push({
        value: option.filterValue,
        color: option.labelColor,
      });
    } else {
      this.selectedFilters[key] = this.selectedFilters[key].filter(
        (o: any) => o.value !== option.filterValue,
      );
    }

    this.filterService.setFilters(this.selectedFilters);
  }

  setVisibility(value: 'private' | 'workspace' | 'public') {
    this.api
      .updateBoard(this.boardId, {
        visibility: value,
      })
      .subscribe((res) => {
        this.boardMembers = [...res.boardMembers];
        this.board.visibility = res.board.visibility;
        this.cdr.markForCheck();
      });
    this.selectedVisibility = value;
  }

  get currentWorkspaceId(): string | null {
    if (!this.board) return null;

    return typeof this.board.workspace === 'string'
      ? this.board.workspace
      : this.board.workspace.name;
  }

  get visibilityIcon(): string {
    if (this.selectedVisibility === 'private') {
      return 'lock';
    } else if (this.selectedVisibility === 'workspace') {
      return 'people_outline';
    } else {
      return 'public';
    }
  }

  get admins() {
    const admins = this.boardMembers.filter((m) => m.role === 'admin');
    return admins;
  }

  get members() {
    const members = this.boardMembers.filter((m) => m.role === 'member');
    return members;
  }

  get isMember(): boolean {
    if (!this.boardMembers || !this.user) return false;

    return this.boardMembers.some(
      (m) => m.role === 'member' && m.user._id === this.user._id,
    );
  }

  isBoardMember(): boolean {
    if (!this.board || !this.user) return false;

    return this.board.members.some(
      (member) => (member as unknown as string) === this.user._id,
    );
  }

  getIsRemovableMember(): boolean {
    if (!this.board) return false;

    if (
      this.board.visibility === 'workspace' ||
      this.board.visibility === 'public'
    ) {
      return false;
    }

    return true;
  }

  editBoardTitle() {
    if (this.isMember) return;
    this.isEditBoardTitle = true;
  }

  openInviteModal() {
    this.dialog.open(ModalComponent, {
      width: '60%',
      maxWidth: '100vw',
      height: '55%',
      data: {
        title: 'Invite board members',
        subtitle: 'Invite people using by entering their name.',
        boardId: this.boardId,
        component: InviteBoardMembersComponent,
      },
    });
  }

  changeWorkspace() {
    const workspaceName = this.boardWorkspaceCtrl.value;
    const workspace = this.workspaces.find((w) => w.name === workspaceName);
    if (!workspaceName) return;

    this.api
      .updateBoard(this.boardId, { workspace: workspace?._id })
      .subscribe((res) => {
        this.board = res.board;
        this.cdr.markForCheck();
      });
  }

  selectedBackground(background: string) {
    this.selectedBg = background;
    this.selectedBgChange.emit(background);
  }

  changeBackground() {
    if (!this.selectedBg || this.selectedBg === this.board.background) return;

    this.api
      .updateBoard(this.boardId, { background: this.selectedBg })
      .subscribe((res) => {
        this.board.background = res.board.background;
        this.selectedBgChange.emit(this.board.background);
        this.cdr.markForCheck();
      });
  }

  copyBoard() {
    if (!this.copyBoardTitle.value || !this.copyBoardWorkspaceCtrl.value)
      return;

    const copyBoardTitle = this.copyBoardTitle.value;
    const workspace = this.workspaces.find(
      (w) => w.name === this.copyBoardWorkspaceCtrl.value,
    );

    this.api
      .copyBoard(this.boardId, {
        title: copyBoardTitle,
        workspace: workspace?._id,
        keepCards: this.keepCardsCtrl.value!,
      })
      .subscribe((res) => {
        this.router.navigate(['/', this.workspaceId, 'boards', res.board._id]);
        this.copyBoardTitle.setValue('');
        this.cdr.markForCheck();
      });
  }

  deleteBoard() {
    this.api.deleteBoard(this.boardId).subscribe(() => {
      this.router.navigate(['/boards']);
    });
  }

  removeMember(memberId: string) {
    this.api.removeBoardMember(memberId, this.boardId).subscribe((res) => {
      this.boardMembers = this.boardMembers.filter(
        (m) => m._id !== res.boardMember._id,
      );
      this.cdr.markForCheck();
    });
  }
}
