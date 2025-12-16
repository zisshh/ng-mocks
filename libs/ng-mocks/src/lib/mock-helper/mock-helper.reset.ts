import coreConfig from '../common/core.config';
import { globalRestoreAsyncCompliance } from '../common/async-compliance';
import ngMocksUniverse from '../common/ng-mocks-universe';

export default (): void => {
  // Treat ngMocks.reset() as a global restore mechanism for async compliance tracking.
  globalRestoreAsyncCompliance();
  ngMocksUniverse.builtDeclarations = new Map();
  ngMocksUniverse.builtProviders = new Map();
  ngMocksUniverse.cacheDeclarations = new Map();
  ngMocksUniverse.cacheProviders = new Map();
  ngMocksUniverse.config = new Map();
  ngMocksUniverse.configInstance = new Map();
  ngMocksUniverse.flags = new Set(coreConfig.flags);
  ngMocksUniverse.touches = new Set();
};
