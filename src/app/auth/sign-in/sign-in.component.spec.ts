import { of, throwError } from 'rxjs';
import { SignInComponent } from './sign-in.component';

describe('SignInComponent', () => {
  let authMock: any;
  let component: SignInComponent;

  beforeEach(() => {
    authMock = {
      signIn: jasmine.createSpy('signIn'),
    };

    component = new SignInComponent(authMock);
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

    expect(authMock.signIn).not.toHaveBeenCalled();
  });

  it('should call signIn with FormData when form is valid', () => {
    const form = {
      invalid: false,
      value: {
        email: 'test@test.com',
        password: '12345',
      },
    } as any;

    authMock.signIn.and.returnValue(of({}));

    component.onSubmit(form);

    expect(authMock.signIn).toHaveBeenCalled();

    const formData = authMock.signIn.calls.mostRecent().args[0];

    expect(formData.get('email')).toBe('test@test.com');
    expect(formData.get('password')).toBe('12345');
  });

  it('should set backend errors on form controls', () => {
    const setErrorsSpy = jasmine.createSpy('setErrors');

    const form = {
      invalid: false,
      value: {
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

    authMock.signIn.and.returnValue(throwError(() => errorResponse));

    component.onSubmit(form);

    expect(setErrorsSpy).toHaveBeenCalledWith({
      backend: 'Invalid email',
    });
  });
});
