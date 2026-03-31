import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ClickOutsideDirective } from '../click-outside.directive';

@Component({
  template: `
    <div id="inside" clickOutside (clickOutside)="onClickedOutside()"></div>
  `,
})
class TestComponent {
  outsideClicked = false;
  onClickedOutside() {
    this.outsideClicked = true;
  }
}

describe('ClickOutsideDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClickOutsideDirective],
      declarations: [TestComponent],
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should emit clickOutside when clicking outside', () => {
    document.body.click();
    expect(component.outsideClicked).toBeTrue();
  });

  it('should NOT emit clickOutside when clicking inside', () => {
    const inside = fixture.debugElement.query(By.css('#inside')).nativeElement;
    inside.click();
    expect(component.outsideClicked).toBeFalse();
  });
});
