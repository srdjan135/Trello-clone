import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatRipple } from '@angular/material/core';
import { Workspace } from '../../../../models/workspace';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule, NgForm } from '@angular/forms';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { bgColorImages, bgImages } from './images';
import { ApiService } from '../../../../shared/services/api.service';
import { Board } from '../../../../models/board.model';

@Component({
  selector: 'app-create-board',
  standalone: true,
  imports: [
    MatRipple,
    MatInput,
    FormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatIconButton,
    MatIcon,
    MatButton,
  ],
  templateUrl: './create-board.component.html',
  styleUrl: './create-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateBoardComponent {
  @Input({ required: true }) workspace!: Workspace;
  @Output() newBoard = new EventEmitter<Board>();
  show: boolean = false;
  bgColorImages: string[] = bgColorImages;
  bgImages: string[] = bgImages;
  selectedBg: string = bgImages[0];

  constructor(private api: ApiService) {}

  onSubmit(form: NgForm) {
    this.api
      .createBoard({
        title: form.value.title,
        background: this.selectedBg,
        workspaceId: this.workspace._id,
      })
      .subscribe((res) => {
        this.newBoard.emit(res.board);
      });
  }
}
