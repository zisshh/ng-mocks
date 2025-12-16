# Agent Instructions for Problem Creation and Solution Development

## 🎯 Core Principles

1. **Always check context first**: Before making any changes, read `CONTEXT.md` to understand what has been done previously
2. **Update context after every change**: After each modification, update `CONTEXT.md` with a brief summary
3. **Verify before committing**: Run validation checks before finalizing patches

---

## 📋 Context Management System

### Context File: `CONTEXT.md`

**MANDATORY**: Create and maintain a `CONTEXT.md` file in the project root. This file tracks:
- What has been implemented
- What tests exist
- What issues were encountered and resolved
- Current state of patches
- Known limitations or TODOs

**Format**:
```markdown
# Project Context

> **IMPORTANT**: Update this file after EVERY change. Keep entries brief (1-2 lines per change).

## Recent Changes Log

### [Date/Time] - [Change Type: Problem/Test/Implementation/Patch]

**What Changed**:
- [Brief description]

**Files Modified**:
- [List of files]

**Why**:
- [Reason for change]


**Update Rules**:
- Update after EVERY file modification
- Keep entries brief (1-2 lines per change)
- Include date/time for each entry
- Remove resolved items from "Next Steps"

---

## 🔄 Workflow Checklist

### Phase 1: Problem Setup
- [ ] Read existing `problem_description.md` (if exists)
- [ ] Check `CONTEXT.md` for previous work
- [ ] Review repository structure and existing code
- [ ] Identify test framework and patterns
- [ ] Understand existing API/interface

### Phase 2: Problem Description
- [ ] Write clear, behavioral requirements (not implementation prescriptions)
- [ ] Avoid implementation details in problem description
- [ ] Focus on WHAT, not HOW
- [ ] Include all edge cases explicitly
- [ ] Verify requirements are testable and deterministic

### Phase 3: Test Creation
- [ ] Create test file: `test/[feature].test.ts`
- [ ] Write tests that FAIL initially (before implementation)
- [ ] Cover all requirements from problem description
- [ ] Include edge cases and error scenarios
- [ ] Ensure tests are deterministic (no randomness, no timing dependencies)
- [ ] Update `CONTEXT.md` after test creation

### Phase 4: Test Runner Setup
- [ ] Create/update `test.sh` with `base`, `new`, and `all` modes
- [ ] Ensure `test.sh` is executable (`chmod +x test.sh`)
- [ ] Test runner should exclude new test file in `base` mode
- [ ] Test runner should run only new tests in `new` mode
- [ ] Update `CONTEXT.md` after test runner setup

### Phase 5: Implementation
- [ ] Read `CONTEXT.md` to understand what's already done
- [ ] Implement feature according to problem description
- [ ] Ensure backward compatibility (opt-in features)
- [ ] Handle all edge cases mentioned in tests
- [ ] Update `CONTEXT.md` after implementation

### Phase 6: Patch Generation
- [ ] Generate `new.patch` with ONLY test-related changes
- [ ] Generate `solution.patch` with ONLY implementation changes
- [ ] Validate patch syntax: `git apply --check [patch]`
- [ ] Verify patches don't contain unintended changes
- [ ] Update `CONTEXT.md` after patch generation

---

## 🚫 Common Mistakes to Avoid

### 1. Patch File Errors

**Mistake**: Corrupt patch syntax (blank lines with `+` prefix, duplicate hunk headers, incorrect line counts)

**Prevention**:
- Always use `git diff` to generate patches, never edit manually
- Validate patches immediately: `git apply --check [patch]`
- Check for:
  - Blank lines should NOT have `+` or `-` prefix
  - Hunk headers must have correct line counts
  - No duplicate hunk headers
  - Context lines must match original file

**Fix Process**:
1. If patch is corrupt, regenerate using `git diff`
2. Never manually edit patch files
3. Validate after regeneration

### 2. Test Strictness Issues

**Mistake**: Tests pass when they should fail (not strict enough)

**Prevention**:
- Always verify tests FAIL before implementation
- Use explicit assertions (e.g., `expect(requestCount).toBe(1)` not `expect(requestCount).toBeLessThan(3)`)
- Reset state between tests (`beforeEach` hooks)
- Verify timestamps/unique identifiers to ensure deduplication
- Test should fail with clear error messages


### 3. Context Loss / Duplicate Work

**Mistake**: Not checking what was done before, re-implementing features

**Prevention**:
- ALWAYS read `CONTEXT.md` before starting work
- Update `CONTEXT.md` after EVERY change
- Check git history if context is unclear
- Ask user if unsure about previous work



### 4. Patch File Content Errors

**Mistake**: Including wrong files in patches (solution code in test patch, etc.)

**Prevention**:
- `test.patch`: ONLY test files and test runner
- `solution.patch`: ONLY implementation files (src/, types, etc.)
- Never include both in same patch
- Verify file list before generating patch

---

## 📝 File-Specific Guidelines

### Problem Description (`problem_description.md`)

**Structure**:
```markdown
# Problem Title
[Clear, concise title]

# Problem Brief
[1-2 sentence summary]

# Agent Instructions
1. [Behavioral requirement 1]
2. [Behavioral requirement 2]
...
```

**Rules**:
- ✅ Describe WHAT the system should do
- ✅ Include observable behaviors
- ✅ Specify edge cases explicitly
- ❌ Don't prescribe HOW (implementation details)
- ❌ Don't mention specific data structures
- ❌ Don't specify internal algorithms

### Test Files (`test/[feature].test.ts`)

**Structure**:
```typescript
describe("[feature name]", () => {
  // Setup
  beforeEach(() => {
    // Reset state
  });

  it("should [behavior]", () => {
    // Test implementation
  });
});
```

**Rules**:
- ✅ Tests must FAIL before implementation
- ✅ Use explicit, strict assertions
- ✅ Reset state between tests
- ✅ Cover all requirements from problem description
- ✅ Test edge cases and error scenarios
- ✅ Use deterministic timing (fake timers where needed)
- ❌ Don't use random values without seeding
- ❌ Don't rely on timing without fake timers
- ❌ Don't write tests that pass without implementation

### Test Runner (`test.sh`)

**Structure**:
```bash
#!/bin/bash
set -e

MODE="${1:-base}"

if [ "$MODE" = "base" ]; then
  # Run base tests (exclude new test file)
elif [ "$MODE" = "new" ]; then
  # Run only new test file
elif [ "$MODE" = "all" ]; then
  # Run all tests
fi
```

**Rules**:
- ✅ Must be executable (`chmod +x test.sh`)
- ✅ Support `base`, `new`, and `all` modes
- ✅ `base` mode excludes new test file
- ✅ `new` mode runs only new test file
- ✅ `all` mode runs full suite
- ✅ Handle missing package managers gracefully

### Patch Files

**`test.patch` Rules**:
- ✅ Contains ONLY test-related changes
- ✅ Includes new test file (as new file)
- ✅ Includes test runner updates
- ✅ May include test/index.test.ts if needed for test runner
- ❌ Never includes src/ files
- ❌ Never includes implementation code

**`solution.patch` Rules**:
- ✅ Contains ONLY implementation changes
- ✅ Includes src/ file modifications
- ✅ Includes type definitions
- ❌ Never includes test files
- ❌ Never includes test runner


---

## 🔍 Pre-Change Checklist

Before making ANY change, verify:

1. [ ] Read `CONTEXT.md` to understand current state

---

## 📊 Post-Change Checklist

After making ANY change, verify:

1. [ ] Update `CONTEXT.md` with change summary

---

## 🛠️ Patch Generation Workflow

### Step 1: Prepare Changes
```bash
# Ensure working directory is clean
git status

# Make your changes to files
# (edit test files for new.patch, edit src files for solution.patch)
```

### Step 2: Stage Changes
```bash
# For new.patch (tests only)
git add test/[feature].test.ts test.sh test/index.test.ts

# For solution.patch (implementation only)
git add src/ types.ts
```

### Step 3: Generate Patch
```bash
# Generate new.patch
git diff --cached > new.patch

# Or for solution.patch
git diff --cached > solution.patch
```

### Step 4: Validate Patch
```bash
# Validate syntax
git apply --check new.patch
git apply --check solution.patch

# If errors, regenerate (never edit manually)
```

### Step 5: Update Context
```markdown
## Patch Files Status
- new.patch: Generated and validated - Contains test changes
- solution.patch: Generated and validated - Contains implementation changes
```

---


## 📚 Problem Description Best Practices

### 1. Behavioral vs Implementation
```markdown
# ✅ GOOD: Behavioral

# ❌ BAD: Implementation

```

### 2. Explicit Edge Cases
```markdown
# ✅ GOOD: Explicit (try to keep minimal edge cases inorder to make problem description concise)

# ❌ BAD: Implicit
```

### 3. Clear Requirements
```markdown
# ✅ GOOD: Clear and testable

# ❌ BAD: Vague

```

---

## 🎯 Quick Reference: Common Commands

```bash
# Validate patch syntax
git apply --check new.patch
git apply --check solution.patch

# Run tests
./test.sh base    # Base tests only
./test.sh new     # New tests only
./test.sh all     # All tests

# Generate patch
git diff --cached > new.patch

# Check context
cat CONTEXT.md

---

## 🚨 Emergency Procedures

### If Patch is Corrupt
1. DO NOT manually edit patch file
2. Regenerate using `git diff`
3. Validate immediately
4. Update CONTEXT.md with issue and resolution

### If Tests Pass When They Shouldn't
1. Check test assertions (should be strict)
2. Verify state reset in beforeEach
3. Add explicit checks (timestamps, counts)
4. Update CONTEXT.md with fix

### If Context is Lost
1. Check git history: `git log --oneline`
2. Review recent file modifications
3. Check problem_description.md for requirements
4. Ask user for clarification if needed

---

## 📝 Context Update Template

After each change, add to CONTEXT.md:

```markdown
## [Date/Time] - [Change Type]

### What Changed
- [Brief description of change]

### Files Modified
- [List of files]

### Why
- [Reason for change]

### Status
- [ ] Tests passing
- [ ] Patch validated
- [ ] Context updated
```

---

## ✅ Final Checklist Before Submission

- [ ] `CONTEXT.md` is up to date

