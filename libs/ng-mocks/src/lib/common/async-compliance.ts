import coreDefineProperty from './core.define-property';
import ngMocksUniverse from './ng-mocks-universe';

type AsyncComplianceState = {
  enabled: boolean;
  history: boolean[];
  patched: boolean;
  spy: any;
};

const STATE = Symbol.for('ngMocks.asyncCompliance.state');
const REGISTRY_KEY = 'ngMocks.asyncCompliance.registry';

const getRegistry = (): Set<any> => {
  const existing = ngMocksUniverse.global.get(REGISTRY_KEY);
  if (existing) {
    return existing as Set<any>;
  }
  const created = new Set<any>();
  ngMocksUniverse.global.set(REGISTRY_KEY, created);
  return created;
};

const getState = (spy: any): AsyncComplianceState => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const existing = spy[STATE] as AsyncComplianceState | undefined;
  if (existing) {
    return existing;
  }
  const created: AsyncComplianceState = {
    enabled: false,
    history: [],
    patched: false,
    spy,
  };
  coreDefineProperty(spy, STATE, created);
  return created;
};

const observeReturnValue = (state: AsyncComplianceState, returned: any): void => {
  if (!state.enabled) {
    return;
  }

  const isObj = (typeof returned === 'object' && returned !== null) || typeof returned === 'function';
  if (!isObj) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const then = (returned as any).then;
  if (typeof then !== 'function') {
    return;
  }

  let syncPhase = true;
  let recorded = false;

  const finalize = (compliant: boolean) => {
    if (recorded) {
      return;
    }
    recorded = true;
    if (!state.enabled) {
      return;
    }
    state.history.push(compliant);
  };

  try {
    // Calling then() is required to detect sync-settling thenables (handlers invoked during attachment).
    then.call(
      returned,
      () => finalize(!syncPhase),
      () => finalize(!syncPhase),
    );
  } catch {
    // If then() itself throws synchronously, treat it as non-compliant.
    finalize(false);
  } finally {
    syncPhase = false;
  }
};

const ensurePatched = (state: AsyncComplianceState): void => {
  if (state.patched) {
    return;
  }
  state.patched = true;

  const spy: any = state.spy;

  // Jasmine spies.
  if (spy && spy.and && typeof spy.and.callFake === 'function') {
    const originalCallFake = spy.and.callFake.bind(spy.and);

    spy.and.callFake = (fn: any) =>
      originalCallFake(function (...args: any[]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-return
        const res = fn.apply(this, args);
        observeReturnValue(state, res);
        return res;
      });

    // Ensure returnValue is also observed by converting it to a callFake wrapper.
    spy.and.returnValue = (value: any) =>
      originalCallFake(function () {
        observeReturnValue(state, value);
        return value;
      });
  }

  // Jest mocks.
  // istanbul ignore else: repo tests run under jasmine by default
  if (spy && typeof spy.mockImplementation === 'function') {
    const originalMockImplementation = spy.mockImplementation.bind(spy);

    spy.mockImplementation = (fn: any) =>
      originalMockImplementation(function (...args: any[]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-return
        const res = fn.apply(this, args);
        observeReturnValue(state, res);
        return res;
      });

    spy.mockReturnValue = (value: any) =>
      originalMockImplementation(function () {
        observeReturnValue(state, value);
        return value;
      });
  }
};

const restoreState = (state: AsyncComplianceState): void => {
  state.history.length = 0;
  state.enabled = false;
  getRegistry().delete(state.spy);
};

export function installAsyncComplianceApi(spy: any): void {
  if (typeof spy !== 'function') {
    return;
  }

  const state = getState(spy);

  // Already installed.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (typeof spy.enableStrictAsyncCompliance === 'function') {
    return;
  }

  coreDefineProperty(spy, 'enableStrictAsyncCompliance', () => {
    state.enabled = true;
    getRegistry().add(spy);
    ensurePatched(state);
    return spy;
  });

  coreDefineProperty(spy, 'getAsyncCompliance', () => (state.enabled ? [...state.history] : []));

  coreDefineProperty(spy, 'resetAsyncCompliance', () => {
    state.history.length = 0;
  });

  coreDefineProperty(spy, 'restoreAsyncCompliance', () => {
    restoreState(state);
  });
}

export function globalRestoreAsyncCompliance(): void {
  const registry = getRegistry();
  for (const spy of Array.from(registry)) {
    if (typeof spy !== 'function') {
      registry.delete(spy);
      continue;
    }
    const state = getState(spy);
    restoreState(state);
  }
  registry.clear();
}
