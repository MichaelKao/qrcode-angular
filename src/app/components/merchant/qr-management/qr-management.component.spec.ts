import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrManagementComponent } from './qr-management.component';

describe('QrManagementComponent', () => {
  let component: QrManagementComponent;
  let fixture: ComponentFixture<QrManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
