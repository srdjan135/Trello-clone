import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Board } from '../../../../models/board.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../../shared/services/api.service';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ClickStopPropagationDirective } from '../../../../shared/directives/click-stop-propagation.directive';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { Filters, filters } from './filters';
import { MatCheckbox } from '@angular/material/checkbox';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { User } from '../../../../models/user.model';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { InviteBoardMembersComponent } from './invite-board-members/invite-board-members.component';
import { BoardMember } from '../../../../models/boardMember';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    MatIconButton,
    MatButton,
    MatTooltip,
    MatIcon,
    ReactiveFormsModule,
    ClickStopPropagationDirective,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatCheckbox,
    AvatarComponent,
    RouterLink,
    MatDivider,
    MatFormField,
    MatLabel,
    MatInput,
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent implements OnInit {
  boardId!: string;
  board!: Board;
  isEditBoardTitle: boolean = false;
  boardTitle = new FormControl('');
  descriptionCtrl = new FormControl('');
  filters: Filters = filters;
  filterKeys = Object.keys(this.filters) as (keyof Filters)[];
  user!: User;
  selectedVisibility: 'private' | 'workspace' | 'public' = 'private';
  isAbout: boolean = false;
  boardMembers!: BoardMember[];

  sectionTitles: Record<keyof Filters, string> = {
    members: 'Members',
    cardStatus: 'Card Status',
    dueDate: 'Due Date',
    labels: 'Labels',
  };

  @ViewChild('titleWrapper') titleWrapper!: ElementRef;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.isEditBoardTitle) return;

    const clickedInside = this.titleWrapper.nativeElement.contains(
      event.target,
    );

    if (!clickedInside) {
      this.isEditBoardTitle = false;
    }
  }

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private api: ApiService,
    private dialog: MatDialog,
  ) {}
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.boardId = params.get('boardId')!;

      this.api.getBoard(this.boardId).subscribe((res) => {
        this.board = res.board;
        this.boardTitle.setValue(this.board.title);
        this.descriptionCtrl.setValue(this.board.description ?? '', {
          emitEvent: false,
        });
        this.cdr.markForCheck();
      });

      this.api.getBoardMembers(this.boardId).subscribe((res) => {
        this.boardMembers = res.boardMembers;
        this.cdr.markForCheck();
      });

      this.descriptionCtrl.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((value) =>
            this.api.updateBoardDescription(value as string, this.boardId),
          ),
        )
        .subscribe((res) => {
          this.descriptionCtrl.setValue(res.board.description ?? '', {
            emitEvent: false,
          });
          this.cdr.markForCheck();
        });
    });

    this.api.getUser().subscribe((res) => {
      this.user = res.user;
      this.cdr.markForCheck();
    });
  }

  setVisibility(value: 'private' | 'workspace' | 'public') {
    this.api.updateBoardVisibility(value, this.boardId).subscribe();
    this.selectedVisibility = value;
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
}
