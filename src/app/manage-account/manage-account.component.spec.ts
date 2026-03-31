import { ManageAccountComponent } from './manage-account.component';
import { of } from 'rxjs';

describe('ManageAccountComponent', () => {
  let component: ManageAccountComponent;
  let apiMock: any;
  let cdrMock: any;
  let snackBarMock: any;

  beforeEach(() => {
    apiMock = {
      getUser: jasmine.createSpy(),
      manageUser: jasmine.createSpy(),
    };

    cdrMock = {
      markForCheck: jasmine.createSpy(),
    };

    snackBarMock = {
      open: jasmine.createSpy(),
    };

    component = new ManageAccountComponent(apiMock, cdrMock, snackBarMock);
  });

  it('should fetch user on init', () => {
    const mockUser = {
      _id: '1',
      username: 'srdjan',
      email: 'test@test.com',
    } as any;

    apiMock.getUser.and.returnValue(of({ user: mockUser }));

    component.ngOnInit();

    expect(apiMock.getUser).toHaveBeenCalled();
    expect(component.user).toEqual(mockUser);
    expect(component.originalUser).toEqual(mockUser);
    expect(cdrMock.markForCheck).toHaveBeenCalled();
  });

  it('should return true if form is invalid', () => {
    const form = { invalid: true } as any;

    expect(component.getIsDisabled(form)).toBeTrue();
  });

  it('should return true if no changes are made', () => {
    component.user = { username: 'a', email: 'b' } as any;
    component.originalUser = { username: 'a', email: 'b' } as any;

    const form = { invalid: false } as any;

    expect(component.getIsDisabled(form)).toBeTrue();
  });

  it('should return false if user data is changed', () => {
    component.user = { username: 'new', email: 'b' } as any;
    component.originalUser = { username: 'old', email: 'b' } as any;

    const form = { invalid: false } as any;

    expect(component.getIsDisabled(form)).toBeFalse();
  });

  it('should NOT call API if form is invalid', () => {
    const form = { invalid: true } as any;

    component.onSubmit(form);

    expect(apiMock.manageUser).not.toHaveBeenCalled();
  });

  it('should call API and show snackbar on success', () => {
    component.user = { _id: '1' } as any;

    const form = {
      invalid: false,
      value: {
        username: 'srdjan',
        email: 'test@test.com',
      },
    } as any;

    apiMock.manageUser.and.returnValue(of({}));

    component.onSubmit(form);

    expect(apiMock.manageUser).toHaveBeenCalledWith(
      { username: 'srdjan', email: 'test@test.com' },
      '1',
    );

    expect(snackBarMock.open).toHaveBeenCalled();
  });
});
