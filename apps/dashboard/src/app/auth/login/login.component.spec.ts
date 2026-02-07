import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authLoginSpy: jest.Mock;
  let routerNavigateSpy: jest.Mock;

  beforeEach(async () => {
    authLoginSpy = jest.fn();
    routerNavigateSpy = jest.fn();

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: { login: authLoginSpy } },
        { provide: Router, useValue: { navigate: routerNavigateSpy } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when empty', () => {
    expect(component.form.valid).toBeFalsy();
  });

  it('form is invalid with invalid email', () => {
    component.form.patchValue({ email: 'not-email', password: 'password123' });
    expect(component.form.valid).toBeFalsy();
  });

  it('form is invalid with short password', () => {
    component.form.patchValue({ email: 'user@acme.com', password: '12345' });
    expect(component.form.valid).toBeFalsy();
  });

  it('form is valid with email and password >= 6 chars', () => {
    component.form.patchValue({ email: 'user@acme.com', password: 'password123' });
    expect(component.form.valid).toBeTruthy();
  });

  it('onSubmit calls auth.login and navigates on success', () => {
    authLoginSpy.mockReturnValue(of({ access_token: 'token', user: {} as any }));
    component.form.patchValue({ email: 'user@acme.com', password: 'password123' });

    component.onSubmit();

    expect(authLoginSpy).toHaveBeenCalledWith('user@acme.com', 'password123');
    expect(routerNavigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('onSubmit sets error on login failure', () => {
    authLoginSpy.mockReturnValue(
      throwError(() => ({ error: { message: 'Invalid credentials' } }))
    );
    component.form.patchValue({ email: 'user@acme.com', password: 'wrong' });

    component.onSubmit();

    expect(component.error).toBe('Invalid credentials');
  });

  it('loading signal is set during login and cleared on completion', () => {
    const loginSubject = new Subject<any>();
    authLoginSpy.mockReturnValue(loginSubject.asObservable());
    component.form.patchValue({ email: 'user@acme.com', password: 'password123' });

    component.onSubmit();
    expect(component.loading()).toBe(true);

    loginSubject.next({ access_token: 'token', user: {} });
    loginSubject.complete();
    expect(component.loading()).toBe(false);
  });
});
