import { Component, Injectable, NgModule } from '@angular/core';

import { MockBuilder, MockInstance, MockRender, MockService, ngMocks } from 'ng-mocks';

@Injectable()
class TargetService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public work(_value?: unknown): unknown {
    return undefined;
  }
}

@Component({
  selector: 'target-async-compliance',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '',
})
class TargetComponent {
  public constructor(private readonly service: TargetService) {
    this.service.work('ctor');
  }
}

@NgModule({
  declarations: [TargetComponent],
  providers: [TargetService],
})
class TargetModule {}

describe('async compliance detector', () => {
  // fix for jest without jasmine assertions
  const assertion: any = typeof jasmine === 'undefined' ? expect : jasmine;

  it('records sync vs async settling for thenable returns', async () => {
    const service = MockService(TargetService);
    const spy: any = (service as any).work;

    expect(spy.enableStrictAsyncCompliance()).toBe(spy);

    spy.and.callFake(() => ({
      then: (resolve: (value: string) => void) => resolve('sync'),
    }));

    spy('a');
    await Promise.resolve();
    expect(spy.getAsyncCompliance()).toEqual([false]);

    spy.and.callFake(() => ({
      then: (resolve: (value: string) => void) =>
        Promise.resolve().then(() => resolve('async')),
    }));

    spy('b');
    await Promise.resolve();
    await Promise.resolve();
    expect(spy.getAsyncCompliance()).toEqual([false, true]);
  });

  it('returns an immutable snapshot and supports reset/restore lifecycle', async () => {
    const service = MockService(TargetService);
    const spy: any = (service as any).work;

    spy.enableStrictAsyncCompliance();

    spy.and.callFake(() => Promise.resolve('ok'));
    spy();
    await Promise.resolve();

    const snapshot: boolean[] = spy.getAsyncCompliance();
    expect(snapshot).toEqual([true]);
    expect(() => snapshot.push(false)).not.toThrow();
    expect(spy.getAsyncCompliance()).toEqual([true]);

    spy.resetAsyncCompliance();
    expect(spy.getAsyncCompliance()).toEqual([]);

    spy();
    await Promise.resolve();
    expect(spy.getAsyncCompliance()).toEqual([true]);

    spy.restoreAsyncCompliance();
    expect(spy.getAsyncCompliance()).toEqual([]);

    spy();
    await Promise.resolve();
    expect(spy.getAsyncCompliance()).toEqual([]);

    spy.enableStrictAsyncCompliance();
    spy();
    await Promise.resolve();
    expect(spy.getAsyncCompliance()).toEqual([true]);
  });

  it('supports spies created via MockInstance and clears on MockInstance.restore()', async () => {
    MockInstance.remember();
    try {
      await MockBuilder(TargetComponent, TargetModule);

      const spy: any = MockInstance(
        TargetService,
        'work',
        typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn(),
      );

      expect(spy.enableStrictAsyncCompliance()).toBe(spy);

      // Ensure the spy returns a thenable so compliance tracking is unambiguous.
      if (typeof jest === 'undefined') {
        spy.and.returnValue(Promise.resolve('ok'));
      } else {
        spy.mockReturnValue(Promise.resolve('ok'));
      }

      MockRender(TargetComponent);
      await Promise.resolve();
      expect(spy.getAsyncCompliance()).toEqual([true]);

      // Global restore mechanism: should disable/clear compliance tracking.
      MockInstance.restore();
      expect(spy.getAsyncCompliance()).toEqual([]);

      MockRender(TargetComponent);
      await Promise.resolve();
      expect(spy.getAsyncCompliance()).toEqual([]);

      spy.enableStrictAsyncCompliance();
      MockRender(TargetComponent);
      await Promise.resolve();
      expect(spy.getAsyncCompliance()).toEqual([true]);
    } finally {
      // Ensure we don't leak scopes to other tests.
      MockInstance.restore();
      ngMocks.reset();
    }
  });

  it('clears/disables compliance tracking on ngMocks.reset()', async () => {
    const service = MockService(TargetService);
    const spy: any = (service as any).work;

    spy.enableStrictAsyncCompliance();

    // Ensure a thenable return so recording is unambiguous.
    spy.and.returnValue(Promise.resolve('ok'));

    spy();
    await Promise.resolve();
    expect(spy.getAsyncCompliance()).toEqual([true]);

    // Treat ngMocks.reset() as a global restore/reset mechanism.
    ngMocks.reset();
    expect(spy.getAsyncCompliance()).toEqual([]);

    spy();
    await Promise.resolve();
    expect(spy.getAsyncCompliance()).toEqual([]);
  });

  it('does not record calls that return non-thenables', () => {
    const service = MockService(TargetService);
    const spy: any = (service as any).work;

    spy.enableStrictAsyncCompliance();
    spy.and.returnValue(123);

    spy();
    expect(spy.getAsyncCompliance()).toEqual([]);
  });
});


