import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPage } from './test.page';

describe('TestPage', () => {
  let component: TestPage;
  let fixture: ComponentFixture<TestPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
