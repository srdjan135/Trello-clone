import { of } from 'rxjs';
import { AccountSettingsComponent } from './account-settings.component';
import { User } from '../models/user.model';

describe('AccountSettingsComponent', () => {
  let apiMock: any;
  let authMock: any;
  let cdrMock: any;
  let component: AccountSettingsComponent;

  beforeEach(() => {
    apiMock = {
      getUser: jasmine.createSpy('getUser'),
      deleteAccount: jasmine.createSpy('deleteAccount'),
    };

    authMock = {
      logout: jasmine.createSpy('logout'),
    };

    cdrMock = {
      markForCheck: jasmine.createSpy('markForCheck'),
    };

    component = new AccountSettingsComponent(apiMock, authMock, cdrMock);
  });

  it('should fetch user on init', () => {
    const mockUser = { username: 'srdjan' } as User;

    apiMock.getUser.and.returnValue(of({ user: mockUser }));

    component.ngOnInit();

    expect(apiMock.getUser).toHaveBeenCalled();
    expect(component.user).toEqual(mockUser);
    expect(cdrMock.markForCheck).toHaveBeenCalled();
  });

  it('should delete account and logout when username matches', () => {
    const mockUser = { username: 'srdjan' } as User;

    component.user = mockUser;
    component.confirmDeleteAccountCtrl.setValue('srdjan');

    apiMock.deleteAccount.and.returnValue(of({}));

    component.deleteAccount();

    expect(apiMock.deleteAccount).toHaveBeenCalled();
    expect(authMock.logout).toHaveBeenCalled();
    expect(cdrMock.markForCheck).toHaveBeenCalled();
  });

  it('should NOT delete account if username does not match', () => {
    component.user = { username: 'srdjan' } as User;
    component.confirmDeleteAccountCtrl.setValue('wrong');

    component.deleteAccount();

    expect(apiMock.deleteAccount).not.toHaveBeenCalled();
    expect(authMock.logout).not.toHaveBeenCalled();
  });
});
