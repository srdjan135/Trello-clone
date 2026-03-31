import { AvatarComponent } from './avatar.component';
import { of } from 'rxjs';

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let apiMock: any;
  let cdrMock: any;

  beforeEach(() => {
    apiMock = {
      getUser: jasmine.createSpy('getUser'),
    };

    cdrMock = {
      markForCheck: jasmine.createSpy('markForCheck'),
    };

    component = new AvatarComponent(apiMock, cdrMock);
  });

  it('should fetch user on init', () => {
    const mockUser = { username: 'srdjan' } as any;

    apiMock.getUser.and.returnValue(of({ user: mockUser }));

    component.ngOnInit();

    expect(apiMock.getUser).toHaveBeenCalled();
    expect(component.user).toEqual(mockUser);
    expect(cdrMock.markForCheck).toHaveBeenCalled();
  });
});
