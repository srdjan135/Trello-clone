import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { AuthService, StoredAccount } from '../auth.service';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let apiMock: jasmine.SpyObj<ApiService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    apiMock = jasmine.createSpyObj('ApiService', ['signIn', 'signUp']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: apiMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(AuthService);

    localStorage.clear();
    sessionStorage.clear();
  });

  // ================= SIGN IN =================

  it('should sign in and set auth data', () => {
    const mockResponse = {
      token: '123',
      expiresIn: 3600,
      user: { _id: '1', username: 'test', email: 'test@mail.com' },
    } as any;

    apiMock.signIn.and.returnValue(of(mockResponse));

    const formData = new FormData();

    service.signIn(formData).subscribe((user) => {
      expect(user).toEqual(mockResponse.user);
    });

    expect(service.getIsAuth()).toBeTrue();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    expect(localStorage.getItem('token')).toBe('123');
  });

  // ================= SIGN UP =================

  it('should sign up and authenticate when token exists', () => {
    const mockResponse = {
      token: '123',
      expiresIn: 3600,
      user: { _id: '1', username: 'test', email: 'test@mail.com' },
    } as any;

    apiMock.signUp.and.returnValue(of(mockResponse));

    const formData = new FormData();
    formData.append('email', 'test@mail.com');
    formData.append('password', '123');

    service.signUp(formData).subscribe();

    expect(service.getIsAuth()).toBeTrue();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should fallback to signIn if signUp has no token', () => {
    apiMock.signUp.and.returnValue(of({} as any));

    const signInResponse = {
      token: '123',
      expiresIn: 3600,
      user: { _id: '1', username: 'test', email: 'test@mail.com' },
    } as any;

    apiMock.signIn.and.returnValue(of(signInResponse));

    const formData = new FormData();
    formData.append('email', 'test@mail.com');
    formData.append('password', '123');

    service.signUp(formData).subscribe();

    expect(apiMock.signIn).toHaveBeenCalled();
  });

  // ================= LOGOUT =================

  it('should logout and clear data', () => {
    localStorage.setItem('token', '123');

    service.logout();

    expect(service.getIsAuth()).toBeFalse();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/signin']);
    expect(localStorage.getItem('token')).toBeNull();
  });

  // ================= AUTO AUTH =================

  it('should auto authenticate if token is valid', fakeAsync(() => {
    const expiration = new Date(new Date().getTime() + 3600 * 1000);

    localStorage.setItem('token', '123');
    localStorage.setItem('expiration', expiration.toISOString());

    service.autoAuthUser();

    expect(service.getIsAuth()).toBeTrue();

    flush();
  }));

  it('should not authenticate if token expired', () => {
    const expiration = new Date(new Date().getTime() - 1000);

    localStorage.setItem('token', '123');
    localStorage.setItem('expiration', expiration.toISOString());

    service.autoAuthUser();

    expect(service.getIsAuth()).toBeFalse();
  });

  // ================= ACCOUNTS =================

  it('should save account', () => {
    const account: StoredAccount = {
      userId: '1',
      username: 'test',
      email: 'test@mail.com',
      token: '123',
    };

    service.saveAccount(account);

    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');

    expect(accounts.length).toBe(1);
    expect(localStorage.getItem('activeAccount')).toBeTruthy();
  });

  it('should not duplicate account', () => {
    const account: StoredAccount = {
      userId: '1',
      username: 'test',
      email: 'test@mail.com',
      token: '123',
    };

    service.saveAccount(account);
    service.saveAccount(account);

    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');

    expect(accounts.length).toBe(1);
  });

  it('should remove account', () => {
    const account: StoredAccount = {
      userId: '1',
      username: 'test',
      email: 'test@mail.com',
      token: '123',
    };

    localStorage.setItem('accounts', JSON.stringify([account]));

    service.removeAccount('1');

    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');

    expect(accounts.length).toBe(0);
  });

  // ================= GETTERS =================

  it('should return stored accounts', () => {
    localStorage.setItem('accounts', JSON.stringify([{ userId: '1' }]));

    const accounts = service.getStoredAccounts();

    expect(accounts.length).toBe(1);
  });
});
