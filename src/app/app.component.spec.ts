import { AppComponent } from './app.component';
import { AuthService } from './shared/services/auth.service';
import { TestBed } from '@angular/core/testing';

describe('AppComponent', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['autoAuthUser']);

    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    });
  });

  it('should call autoAuthUser on init', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(authServiceMock.autoAuthUser).toHaveBeenCalled();
  });
});
