import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../shared/services/api.service';
import { SharedService } from '../shared/services/shared.service';
import { WorkspaceService } from '../shared/services/workspace.service';
import { SidenavComponent } from './sidenav.component';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('SidenavComponent', () => {
  let component: SidenavComponent;
  let fixture: ComponentFixture<SidenavComponent>;

  let workspaceServiceMock: any;
  let apiServiceMock: any;
  let sharedServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    workspaceServiceMock = {
      workspaceId: of('123'),
      getWorkspaces: jasmine.createSpy().and.returnValue(of(null)),
      workspaces: of([{ _id: '123', name: 'Test Workspace' }]),
    };

    apiServiceMock = {
      getMyRole: jasmine.createSpy().and.returnValue(of({ role: 'admin' })),
    };

    sharedServiceMock = {
      openCreateWorkspaceModal: jasmine.createSpy(),
    };

    routerMock = {
      url: '/workspace/123',
      navigate: jasmine.createSpy(),
      events: of(),
    };

    await TestBed.configureTestingModule({
      imports: [SidenavComponent, NoopAnimationsModule],
      providers: [
        { provide: WorkspaceService, useValue: workspaceServiceMock },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: SharedService, useValue: sharedServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidenavComponent);
    component = fixture.componentInstance;
  });

  it('should set workspaceId and isAdmin on init', () => {
    fixture.detectChanges();

    expect(component.workspaceId).toBe('123');
    expect(apiServiceMock.getMyRole).toHaveBeenCalledWith('123');
    expect(component.isAdmin).toBeTrue();
  });

  it('should load workspaces and stop loading', () => {
    fixture.detectChanges();

    expect(workspaceServiceMock.getWorkspaces).toHaveBeenCalled();
    expect(component.workspaces.length).toBe(1);
    expect(component.isLoading).toBeFalse();
  });

  it('should return true if workspace is active', () => {
    const result = component.isWorkspaceActive('123');
    expect(result).toBeTrue();
  });

  it('should return false if workspace is not active', () => {
    const result = component.isWorkspaceActive('999');
    expect(result).toBeFalse();
  });

  it('should open workspace modal', () => {
    component.openWorkspaceModal();

    expect(sharedServiceMock.openCreateWorkspaceModal).toHaveBeenCalled();
  });
});
