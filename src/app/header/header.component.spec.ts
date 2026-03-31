import { of } from 'rxjs';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let cdrMock: any;
  let apiMock: any;
  let authMock: any;
  let sharedMock: any;
  let routerMock: any;
  let workspaceMock: any;
  let component: HeaderComponent;

  beforeEach(() => {
    apiMock = {
      getUser: jasmine.createSpy(),
      getNotifications: jasmine.createSpy(),
      getWorkspaces: jasmine.createSpy(),
      readNotifications: jasmine.createSpy(),
      declineInvite: jasmine.createSpy(),
      acceptInvite: jasmine.createSpy(),
      deleteNotification: jasmine.createSpy(),
    };

    authMock = { logout: jasmine.createSpy() };
    cdrMock = { markForCheck: jasmine.createSpy() };
    routerMock = { navigate: jasmine.createSpy() };
    sharedMock = { openCreateWorkspaceModal: jasmine.createSpy() };
    workspaceMock = { updateWorkspacesList: jasmine.createSpy() };

    component = new HeaderComponent(
      cdrMock,
      apiMock,
      authMock,
      sharedMock,
      routerMock,
      workspaceMock,
    );
  });

  it('should fetch user and notifications on init', () => {
    apiMock.getUser.and.returnValue(of({ user: { username: 'srdjan' } }));
    apiMock.getNotifications.and.returnValue(of({ notifications: [] }));
    apiMock.getWorkspaces.and.returnValue(of({ worksapces: [] }));

    component.ngOnInit();

    expect(apiMock.getUser).toHaveBeenCalled();
    expect(apiMock.getNotifications).toHaveBeenCalled();
    expect(component.user.username).toBe('srdjan');
    expect(component.isLoading).toBeFalse();
  });

  it('should apply theme and save to localStorage', () => {
    spyOn(localStorage, 'setItem');

    component.applyTheme('dark');

    expect(document.body.classList.contains('dark-theme')).toBeTrue();
    expect(localStorage.setItem).toHaveBeenCalledWith('Theme', 'dark');
  });

  it('should navigate to board and clear search', () => {
    const board = {
      _id: 'b1',
      workspace: { _id: 'w1', name: 'Test' },
    } as any;

    component.openBoard(board);

    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/',
      'w1',
      'boards',
      'b1',
    ]);

    expect(component.searchControl.value).toBe('');
  });

  it('should return number of unread notifications', () => {
    component.notifications = [
      { read: false },
      { read: true },
      { read: false },
    ] as any;

    expect(component.unreadNotifications).toBe(2);
  });

  it('should mark all notifications as read', () => {
    component.user = { _id: '1' } as any;
    component.notifications = [{ _id: '1', read: false }] as any;

    apiMock.readNotifications.and.returnValue(of({}));

    component.readNotifications();

    expect(component.notifications[0].read).toBeTrue();
  });

  it('should accept invite and update workspace', () => {
    component.notifications = [{ _id: '1' }] as any;

    apiMock.acceptInvite.and.returnValue(of({ workspace: { _id: 'w1' } }));

    component.acceptInvite('1');

    expect(workspaceMock.updateWorkspacesList).toHaveBeenCalled();
    expect(component.notifications.length).toBe(0);
  });

  it('should call logout', () => {
    component.logout();

    expect(authMock.logout).toHaveBeenCalled();
  });
});
