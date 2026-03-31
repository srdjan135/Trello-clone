import { of, throwError } from 'rxjs';
import { SignUpComponent } from './sign-up.component';

describe('SignUpComponent', () => {
  let authMock: any;
  let component: SignUpComponent;

  beforeEach(() => {
    authMock = {
      signUp: jasmine.createSpy('signUp'),
    };

    component = new SignUpComponent(authMock);
  });

  it('should toggle hide and stop propagation', () => {
    const event = {
      stopPropagation: jasmine.createSpy('stopPropagation'),
    } as any;

    const initial = component.hide();

    component.clickEvent(event);

    expect(component.hide()).toBe(!initial);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should not call signIn if form is invalid', () => {
    const form = {
      invalid: true,
    } as any;

    component.onSubmit(form);

    expect(authMock.signUp).not.toHaveBeenCalled();
  });

  it('should call signIn with FormData when form is valid', () => {
    const form = {
      invalid: false,
      value: {
        username: 'srdjan',
        email: 'test@test.com',
        password: '12345',
      },
    } as any;

    authMock.signUp.and.returnValue(of({}));

    component.onSubmit(form);

    expect(authMock.signUp).toHaveBeenCalled();

    const formData = authMock.signUp.calls.mostRecent().args[0];

    expect(formData.get('username')).toBe('srdjan');
    expect(formData.get('email')).toBe('test@test.com');
    expect(formData.get('password')).toBe('12345');
  });

  it('should set backend errors on form controls', () => {
    const setErrorsSpy = jasmine.createSpy('setErrors');

    const form = {
      invalid: false,
      value: {
        username: 'srdjan',
        email: 'test@test.com',
        password: '12345',
      },
      controls: {
        email: { setErrors: setErrorsSpy },
      },
    } as any;

    const errorResponse = {
      error: {
        errors: [{ field: 'email', message: 'Invalid email' }],
      },
    };

    authMock.signUp.and.returnValue(throwError(() => errorResponse));

    component.onSubmit(form);

    expect(setErrorsSpy).toHaveBeenCalledWith({
      backend: 'Invalid email',
    });
  });
});
