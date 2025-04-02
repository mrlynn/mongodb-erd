#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test directory
TEST_DIR="test-output"
mkdir -p $TEST_DIR

# Check if MongoDB is running
if ! mongosh --eval "db.version()" >/dev/null 2>&1; then
    echo -e "${RED}Error: MongoDB is not running. Please start MongoDB first.${NC}"
    echo "You can start MongoDB using: brew services start mongodb-community"
    exit 1
fi

# Check if test database is set up
if ! mongosh --eval "db.getMongo().getDBs().map(db => db.name).includes('test_db')" >/dev/null 2>&1; then
    echo -e "${YELLOW}Setting up test database...${NC}"
    npm run setup-test-db
fi

# Test cases
test_cases=(
  "Basic SVG output"
  "PNG output with dark theme"
  "Collection filtering"
  "Error handling"
)

# Function to run test
run_test() {
  local test_name=$1
  local command=$2
  local expected_exit=$3

  echo -e "\n${GREEN}Running test: $test_name${NC}"
  echo "Command: $command"
  
  eval $command
  local exit_code=$?
  
  if [ $exit_code -eq ${expected_exit:-0} ]; then
    echo -e "${GREEN}✓ Test passed${NC}"
    return 0
  else
    echo -e "${RED}✗ Test failed${NC}"
    return 1
  fi
}

# Counter for failed tests
failed_tests=0

# Test 1: Basic SVG output
run_test "${test_cases[0]}" \
  "mongodb-erd --uri 'mongodb://localhost:27017' --database 'test_db' --output '$TEST_DIR/basic.svg'" \
  0 || ((failed_tests++))

# Test 2: PNG output with dark theme
run_test "${test_cases[1]}" \
  "mongodb-erd --uri 'mongodb://localhost:27017' --database 'test_db' --output '$TEST_DIR/dark.png' --format png --theme dark" \
  0 || ((failed_tests++))

# Test 3: Collection filtering
run_test "${test_cases[2]}" \
  "mongodb-erd --uri 'mongodb://localhost:27017' --database 'test_db' --output '$TEST_DIR/filtered.svg' --include 'users,posts'" \
  0 || ((failed_tests++))

# Test 4: Error handling (invalid URI)
run_test "${test_cases[3]}" \
  "mongodb-erd --uri 'invalid-uri' --database 'test_db' --output '$TEST_DIR/error.svg'" \
  1 || ((failed_tests++))

echo -e "\n${GREEN}Test Summary:${NC}"
echo "Output files are in the '$TEST_DIR' directory"
echo "Total tests: ${#test_cases[@]}"
echo "Failed tests: $failed_tests"

if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}$failed_tests test(s) failed${NC}"
    exit 1
fi 