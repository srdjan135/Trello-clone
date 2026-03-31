import { of } from 'rxjs';
import { ContactSupportComponent } from './contact-support.component';

describe('ContactSupportComponent', () => {
  let snackBarMock: any;
  let apiMock: any;
  let cdrMock: any;
  let component: ContactSupportComponent;

  beforeEach(() => {
    apiMock = { contactSupport: jasmine.createSpy('contactSupport') };
    snackBarMock = { open: jasmine.createSpy('open') };
    cdrMock = { markForCheck: jasmine.createSpy('markForCheck') };

    component = new ContactSupportComponent(snackBarMock, apiMock, cdrMock);
  });

  it('should not call onSubmit if form is invalid', () => {
    const form = { invalid: true } as any;

    component.onSubmit(form);

    expect(apiMock.contactSupport).not.toHaveBeenCalled();
  });

  it('should call onSubmit with form values when form is valid', () => {
    const form = {
      invalid: false,
      value: {
        category: 'bug',
        subject: 'Report some bug',
        message: 'Bug in header component',
      },
      reset: jasmine.createSpy('reset'),
    } as any;

    apiMock.contactSupport.and.returnValue(of({}));

    component.onSubmit(form);

    expect(apiMock.contactSupport).toHaveBeenCalledWith({
      category: 'bug',
      subject: 'Report some bug',
      message: 'Bug in header component',
    });
    expect(snackBarMock.open).toHaveBeenCalled();
    expect(form.reset).toHaveBeenCalled();
    expect(cdrMock.markForCheck).toHaveBeenCalled();
  });
});
