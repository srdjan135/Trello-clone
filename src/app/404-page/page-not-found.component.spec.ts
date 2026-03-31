import { Router } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found.component';

describe('PageNotFoundComponent', () => {
  it('should navigate to /boards when goHome is called', () => {
    const routerMock = {
      navigate: jasmine.createSpy('navigate'),
    } as unknown as Router;

    const component = new PageNotFoundComponent(routerMock);

    component.goHome();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/boards']);
  });
});
