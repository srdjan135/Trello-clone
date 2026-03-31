import { TestBed } from '@angular/core/testing';
import { ExampleHeader } from './datepicker-header.component';
import { MatCalendar } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { Subject } from 'rxjs';

describe('ExampleHeader', () => {
  let component: ExampleHeader<any>;

  let calendarMock: any;
  let dateAdapterMock: any;

  beforeEach(() => {
    calendarMock = {
      activeDate: new Date(2024, 0, 1),
      stateChanges: new Subject(),
    };

    dateAdapterMock = {
      format: jasmine.createSpy('format').and.returnValue('Jan 2024'),
      addCalendarMonths: jasmine
        .createSpy('addCalendarMonths')
        .and.callFake((date, val) => new Date(2024, val, 1)),
      addCalendarYears: jasmine
        .createSpy('addCalendarYears')
        .and.callFake((date, val) => new Date(2024 + val, 0, 1)),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: MatCalendar, useValue: calendarMock },
        { provide: DateAdapter, useValue: dateAdapterMock },
        {
          provide: MAT_DATE_FORMATS,
          useValue: {
            display: {
              monthYearLabel: 'MMM YYYY',
            },
          },
        },
      ],
    });

    component = TestBed.runInInjectionContext(() => new ExampleHeader());
  });

  it('should update periodLabel when stateChanges emits', () => {
    calendarMock.stateChanges.next();

    expect(dateAdapterMock.format).toHaveBeenCalled();
    expect(component.periodLabel()).toBe('JAN 2024');
  });

  it('should go to previous month', () => {
    const initialDate = new Date(2024, 0, 1);
    calendarMock.activeDate = initialDate;

    component.previousClicked('month');

    expect(dateAdapterMock.addCalendarMonths).toHaveBeenCalledWith(
      initialDate,
      -1,
    );
  });

  it('should go to next year', () => {
    const initialDate = new Date(2024, 0, 1);
    calendarMock.activeDate = initialDate;

    component.nextClicked('year');

    expect(dateAdapterMock.addCalendarYears).toHaveBeenCalledWith(
      initialDate,
      1,
    );
  });

  it('should complete destroyed subject on destroy', () => {
    spyOn((component as any)._destroyed, 'next');
    spyOn((component as any)._destroyed, 'complete');

    component.ngOnDestroy();

    expect((component as any)._destroyed.next).toHaveBeenCalled();
    expect((component as any)._destroyed.complete).toHaveBeenCalled();
  });
});
