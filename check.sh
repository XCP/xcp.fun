#!/bin/bash

echo "🔍 Running pre-commit checks..."
echo ""

# Run lint check
echo "📝 ESLint..."
npm run lint
LINT_EXIT=$?

echo ""

# Run TypeScript type check
echo "📘 TypeScript type check..."
npm run type-check
TYPE_EXIT=$?

echo ""

# Check if all passed
if [ $LINT_EXIT -eq 0 ] && [ $TYPE_EXIT -eq 0 ]; then
  echo "✅ All checks passed! Safe to commit."
  exit 0
else
  echo "❌ Some checks failed. Please fix the errors above."
  exit 1
fi