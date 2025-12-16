#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-base}"

cd "$(dirname "$0")"

case "$MODE" in
  base)
    # A small, stable subset of existing tests that should pass on the base commit.
    # Note: `karma.conf.ts` honors `KARMA_SUITE` to select a specific spec pattern.
    KARMA_SUITE='./tests/spies/test.spec.ts' npx --no-install karma start
    ;;
  new)
    # Only the new tests added for this task. These should fail until the feature is implemented.
    # Note: `karma.conf.ts` honors `KARMA_SUITE` to select a specific spec pattern.
    KARMA_SUITE='./tests/async-compliance/test.spec.ts' npx --no-install karma start
    ;;
  *)
    echo "Usage: ./test.sh base|new" >&2
    exit 2
    ;;
esac
