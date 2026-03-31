import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ClickStopPropagationDirective } from '../click-stop-propagation.directive';

@Component({
  template: `
    <button id="btn1" [preventDefault]="true" clickStopPropagation>
      Button 1
    </button>
    <button id="btn2" [preventDefault]="false" clickStopPropagation>
      Button 2
    </button>
  `,
})
class TestComponent {}

describe('ClickStopPropagationDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let btn1: HTMLElement;
  let btn2: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClickStopPropagationDirective],
      declarations: [TestComponent],
    });

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    btn1 = fixture.debugElement.query(By.css('#btn1')).nativeElement;
    btn2 = fixture.debugElement.query(By.css('#btn2')).nativeElement;
  });

  it('should call stopPropagation and preventDefault when preventDefault=true', () => {
    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');
    spyOn(event, 'preventDefault');

    btn1.dispatchEvent(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should call only stopPropagation when preventDefault=false', () => {
    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');
    spyOn(event, 'preventDefault');

    btn2.dispatchEvent(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
