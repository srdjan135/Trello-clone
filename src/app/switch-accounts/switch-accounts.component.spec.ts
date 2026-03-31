import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwitchAccountsComponent } from './switch-accounts.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import { ApiService } from '../shared/services/api.service';
import { AuthService } from '../shared/services/auth.service';

describe('SwitchAccountsComponent', () => {
  let component: SwitchAccountsComponent;
  let fixture: ComponentFixture<SwitchAccountsComponent>;

  let authServiceMock: jasmine.SpyObj<AuthService>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let snackBarMock: jasmine.SpyObj<MatSnackBar>;
  let cdrMock: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', [
      'getStoredAccounts',
      'switchAccount',
      'removeAccount',
    ]);

    apiServiceMock = jasmine.createSpyObj('ApiService', ['getUser']);
    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
    cdrMock = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);

    await TestBed.configureTestingModule({
      imports: [SwitchAccountsComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: ChangeDetectorRef, useValue: cdrMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SwitchAccountsComponent);
    component = fixture.componentInstance;

    component['cdr'] = cdrMock;
  });

  it('should load accounts and user on init', () => {
    const mockAccounts = [
      { userId: '1', username: 'test1' },
      { userId: '2', username: 'test2' },
    ] as any;

    const mockUser = { id: '1', username: 'test1' } as any;

    authServiceMock.getStoredAccounts.and.returnValue(mockAccounts);
    apiServiceMock.getUser.and.returnValue(of({ user: mockUser }));

    component.ngOnInit();

    expect(component.isLoading).toBeFalse();
    expect(component.accounts).toEqual(mockAccounts);
    expect(component.currentUser).toEqual(mockUser);
    expect(cdrMock.markForCheck).toHaveBeenCalled();
  });

  it('should switch account and show snackbar', () => {
    const account = { userId: '1', username: 'test1' } as any;

    component.switch(account);

    expect(authServiceMock.switchAccount).toHaveBeenCalledWith(account);
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Switched to test1 account!',
      'Close',
      {
        duration: 2000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      },
    );
  });

  it('should remove account and refresh accounts list', () => {
    const account = { userId: '1', username: 'test1' } as any;
    const updatedAccounts = [{ userId: '2', username: 'test2' }] as any;

    authServiceMock.getStoredAccounts.and.returnValue(updatedAccounts);

    component.remove(account);

    expect(authServiceMock.removeAccount).toHaveBeenCalledWith('1');
    expect(component.accounts).toEqual(updatedAccounts);
  });
});
