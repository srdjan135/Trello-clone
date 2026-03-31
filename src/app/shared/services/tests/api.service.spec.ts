import { TestBed } from '@angular/core/testing';
import { ApiService } from '../api.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const API_URL = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ================= AUTH =================

  it('should sign up user', () => {
    const mockResponse = {
      token: '123',
      expiresIn: 3600,
      user: {} as any,
    };

    const formData = new FormData();

    service.signUp(formData).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${API_URL}/signup`);
    expect(req.request.method).toBe('POST');

    req.flush(mockResponse);
  });

  it('should sign in user', () => {
    const formData = new FormData();

    service.signIn(formData).subscribe();

    const req = httpMock.expectOne(`${API_URL}/signin`);
    expect(req.request.method).toBe('POST');

    req.flush({});
  });

  it('should get user', () => {
    const mockUser = { user: {} as any };

    service.getUser().subscribe((res) => {
      expect(res).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${API_URL}/user`);
    expect(req.request.method).toBe('GET');

    req.flush(mockUser);
  });

  // ================= USERS =================

  it('should search users with params', () => {
    service.searchUsers('john', '1', 'workspace', '2').subscribe();

    const req = httpMock.expectOne(
      (request) =>
        request.url === `${API_URL}/users/search` &&
        request.params.get('q') === 'john' &&
        request.params.get('workspaceId') === '1' &&
        request.params.get('type') === 'workspace' &&
        request.params.get('boardId') === '2',
    );

    expect(req.request.method).toBe('GET');

    req.flush({ users: [] });
  });

  it('should delete account', () => {
    service.deleteAccount().subscribe();

    const req = httpMock.expectOne(`${API_URL}/users/user/delete`);
    expect(req.request.method).toBe('DELETE');

    req.flush({});
  });

  // ================= WORKSPACES =================

  it('should get workspaces', () => {
    service.getWorkspaces().subscribe();

    const req = httpMock.expectOne(`${API_URL}/workspaces`);
    expect(req.request.method).toBe('GET');

    req.flush({ workspaces: [] });
  });

  it('should create workspace', () => {
    const data = { name: 'Test', description: 'Desc' };

    service.createWorkspace(data).subscribe();

    const req = httpMock.expectOne(`${API_URL}/workspaces`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);

    req.flush({ workspace: {} });
  });

  it('should update workspace', () => {
    const data = {
      name: 'Test',
      description: 'Desc',
      isPrivate: true,
    };

    service.updateWorkspace(data, '1').subscribe();

    const req = httpMock.expectOne(`${API_URL}/workspaces/1`);
    expect(req.request.method).toBe('PUT');

    req.flush({ updatedWorkspace: {} });
  });

  it('should delete workspace', () => {
    service.deleteWorkspace('1').subscribe();

    const req = httpMock.expectOne(`${API_URL}/workspaces/1`);
    expect(req.request.method).toBe('DELETE');

    req.flush({});
  });

  // ================= BOARDS =================

  it('should get boards', () => {
    service.getBoards('1').subscribe();

    const req = httpMock.expectOne(`${API_URL}/1/boards`);
    expect(req.request.method).toBe('GET');

    req.flush({ boards: [] });
  });

  it('should create board', () => {
    const data = {
      title: 'Board',
      background: 'blue',
      workspaceId: '1',
    };

    service.createBoard(data).subscribe();

    const req = httpMock.expectOne(`${API_URL}/1/boards`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);

    req.flush({ board: {} });
  });

  it('should update board', () => {
    service.updateBoard('1', { title: 'Updated' }).subscribe();

    const req = httpMock.expectOne(`${API_URL}/boards/1/update`);
    expect(req.request.method).toBe('PATCH');

    req.flush({ board: {}, boardMembers: [] });
  });

  it('should delete board', () => {
    service.deleteBoard('1').subscribe();

    const req = httpMock.expectOne(`${API_URL}/boards/1/delete`);
    expect(req.request.method).toBe('DELETE');

    req.flush({});
  });

  // ================= COLUMNS =================

  it('should create column', () => {
    service.createColumn('Test', '1').subscribe();

    const req = httpMock.expectOne(`${API_URL}/1/columns`);
    expect(req.request.method).toBe('POST');

    req.flush({ column: {} });
  });

  it('should move column', () => {
    service.moveColumn('col1', 'board1', 2).subscribe();

    const req = httpMock.expectOne(`${API_URL}/columns/col1/move`);
    expect(req.request.method).toBe('PATCH');

    expect(req.request.body).toEqual({
      targetBoardId: 'board1',
      newOrder: 2,
    });

    req.flush({ sourceColumns: [], targetColumns: [] });
  });

  // ================= CARDS =================

  it('should create card', () => {
    service.createCard('Card', 'col1').subscribe();

    const req = httpMock.expectOne(`${API_URL}/col1/cards`);
    expect(req.request.method).toBe('POST');

    req.flush({ card: {} });
  });

  it('should update card and emit value', () => {
    const mockCard = { _id: '1' } as any;
    let emittedCard: any;

    service.cardUpdated.subscribe((card) => {
      emittedCard = card;
    });

    service.updateCard('1', {}).subscribe();

    const req = httpMock.expectOne(`${API_URL}/cards/1`);
    expect(req.request.method).toBe('PATCH');

    req.flush({ card: mockCard });

    expect(emittedCard).toEqual(mockCard);
  });

  it('should move card', () => {
    service.moveCard('col1', 'card1', 3).subscribe();

    const req = httpMock.expectOne(`${API_URL}/card1/move`);
    expect(req.request.method).toBe('PATCH');

    expect(req.request.body).toEqual({
      columnId: 'col1',
      order: 3,
    });

    req.flush({ cards: [] });
  });

  it('should delete card', () => {
    service.deleteCard('1').subscribe();

    const req = httpMock.expectOne(`${API_URL}/1/delete`);
    expect(req.request.method).toBe('DELETE');

    req.flush({});
  });

  // ================= COMMENTS =================

  it('should create comment', () => {
    service.createComment('Test', '1').subscribe();

    const req = httpMock.expectOne(`${API_URL}/1/comments`);
    expect(req.request.method).toBe('POST');

    req.flush({ comment: {} });
  });

  it('should update comment', () => {
    service.updateComment('1', 'Updated').subscribe();

    const req = httpMock.expectOne(`${API_URL}/comments/1`);
    expect(req.request.method).toBe('PATCH');

    req.flush({ comment: {} });
  });

  it('should delete comment', () => {
    service.deleteComment('1').subscribe();

    const req = httpMock.expectOne(`${API_URL}/comments/1/delete`);
    expect(req.request.method).toBe('DELETE');

    req.flush({});
  });

  // ================= SUPPORT =================

  it('should contact support', () => {
    const data = {
      category: 'bug',
      subject: 'Test',
      message: 'Help',
    };

    service.contactSupport(data).subscribe();

    const req = httpMock.expectOne(`${API_URL}/contact-support`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);

    req.flush({});
  });
});
