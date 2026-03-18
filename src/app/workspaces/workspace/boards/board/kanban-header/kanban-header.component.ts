import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
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
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
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
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.route.paramMap.subscribe((params) => {
      this.boardId = params.get('boardId')!;
      this.workspaceId = params.get('workspaceId')!;

      this.api.getBoard(this.boardId).subscribe((res) => {
        this.board = res.board;
        this.selectedVisibility = res.board.visibility;
        this.selectedBg = res.board.background;
        this.selectedBgChange.emit(res.board.background);
        this.boardTitle.setValue(this.board.title);
        this.descriptionCtrl.setValue(this.board.description ?? '', {
          emitEvent: false,
        });
        if (typeof this.board.workspace !== 'string') {
          this.boardWorkspaceCtrl.setValue(this.board.workspace.name, {
            emitEvent: false,
          });
          this.copyBoardWorkspaceCtrl.setValue(this.board.workspace.name, {
            emitEvent: false,
          });
        }
        this.cdr.markForCheck();
      });

      this.api.getBoardMembers(this.boardId).subscribe((res) => {
        this.boardMembers = res.boardMembers;
        this.isLoading = false;
        this.cdr.markForCheck();
      });

      this.descriptionCtrl.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((value) =>
            this.api.updateBoard(this.boardId, {
              description: value as string,
            }),
          ),
        )
        .subscribe((res) => {
          this.descriptionCtrl.setValue(res.board.description ?? '', {
            emitEvent: false,
          });
          this.cdr.markForCheck();
        });

      this.boardTitle.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((value) =>
            this.api.updateBoard(this.boardId, { title: value as string }),
          ),
        )
        .subscribe((res) => {
          this.boardTitle.setValue(res.board.title ?? '', {
            emitEvent: false,
          });
          this.cdr.markForCheck();
        });
    });
    this.api.getUser().subscribe((res) => {
      this.user = res.user;
      this.cdr.markForCheck();
    });
    this.api.getWorkspaces().subscribe((res) => {
      this.workspaces = res.workspaces;
      this.cdr.markForCheck();
    });
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

  getIsRemovableMember() {
    return this.board.visibility !== 'workspace';
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
