import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { AuthService } from '../../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-invite',
  standalone: true,
  imports: [CommonModule, MatButton],
  templateUrl: './invite.component.html',
  styleUrl: './invite.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteComponent implements OnInit {
  token!: string;
  error = '';
  workspaceId!: string;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token')!;

    this.api.validateInviteWithLink(this.token).subscribe({
      next: (res) => {
        this.workspaceId = res.workspaceId;
      },
      error: () => {
        this.error = 'Invite link is incorrect or expired.';
      },
    });
  }

  acceptInvite() {
    if (!this.auth.isAuthenticated) {
      this.router.navigate(['/login'], {
        queryParams: { redirect: `/invite/${this.token}` },
      });
      return;
    }

    this.api.acceptInviteWithLink(this.token).subscribe({
      next: () => {
        this.router.navigate([this.workspaceId, 'members']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Something went wrong!';
        this.cdr.markForCheck();
      },
    });
  }
}
