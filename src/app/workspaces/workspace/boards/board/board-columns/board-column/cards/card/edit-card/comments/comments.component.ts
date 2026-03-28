import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  MatFormField,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ClickStopPropagationDirective } from '../../../../../../../../../../shared/directives/click-stop-propagation.directive';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../../../../../../../../shared/services/api.service';
import { Comment } from '../../../../../../../../../../models/comment.model';
import { DatePipe } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    MatButtonModule,
    ClickStopPropagationDirective,
    MatSuffix,
    ReactiveFormsModule,
    DatePipe,
    MatMenuModule,
  ],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentsComponent implements OnInit {
  @Input({ required: true }) cardId!: string;

  @ViewChild('editInput') editInput!: ElementRef<HTMLInputElement>;

  commentCtrl = new FormControl('');
  contentCtrl = new FormControl('');
  comments: Comment[] = [];
  editingCommentId!: string | null;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.api.getComments(this.cardId).subscribe((res) => {
      this.comments = res.comments;
      this.cdr.markForCheck();
    });
  }

  createComment() {
    if (!this.commentCtrl.value) return;

    this.api
      .createComment(this.commentCtrl.value, this.cardId)
      .subscribe((res) => {
        this.commentCtrl.setValue('');
        this.comments = [...this.comments, res.comment];
        this.api
          .updateCard(this.cardId, { comments: this.comments })
          .subscribe();
        this.cdr.markForCheck();
      });
  }

  editingComment(commentId: string) {
    this.editingCommentId = commentId;

    const comment = this.comments.find((c) => c._id === commentId)!;
    this.contentCtrl.setValue(comment.content);

    setTimeout(() => {
      this.editInput?.nativeElement.focus();
    });
  }

  cancelEditing() {
    this.editingCommentId = null;
  }

  updateComment(commentId: string) {
    if (!this.contentCtrl.value) return;

    this.api
      .updateComment(commentId, this.contentCtrl.value)
      .subscribe((res) => {
        this.editingCommentId = null;
        const comment = this.comments.find((c) => c._id === commentId)!;
        comment.content = res.comment.content;
        this.cdr.markForCheck();
      });
  }

  deleteComment(commentId: string) {
    this.api.deleteComment(commentId).subscribe(() => {
      this.comments = this.comments.filter((c) => c._id !== commentId);
      this.api.updateCard(this.cardId, { comments: this.comments }).subscribe();
      this.cdr.markForCheck();
    });
  }
}
