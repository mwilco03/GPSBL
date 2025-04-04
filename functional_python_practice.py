# 🐍 Functional-Style Python Practice for Beginners
# Focus: Pure functions, loops, recursion, immutability — NO lambdas yet
# Each function includes:
# - Clear TODOs
# - References to look up (e.g., "See: Python for loop")
# - 4 test cases with expected outputs

# === Beginner Problems: Arithmetic, Strings, Loops, Lists ===

# 1. Add Two Numbers
def add(a, b):
    # TODO: Return the sum of a and b
    # See: Python return statement
    pass

# Tests
print(add(2, 3))       # Expected: 5
print(add(-1, 1))      # Expected: 0
print(add(0, 0))       # Expected: 0
print(add(100, 250))   # Expected: 350

# 2. Convert Celsius to Fahrenheit
def celsius_to_fahrenheit(celsius):
    # TODO: Apply the formula: Fahrenheit = Celsius * 9/5 + 32
    # See: Python arithmetic operators
    pass

# Tests
print(celsius_to_fahrenheit(0))    # Expected: 32.0
print(celsius_to_fahrenheit(100))  # Expected: 212.0
print(celsius_to_fahrenheit(-40))  # Expected: -40.0
print(celsius_to_fahrenheit(37))   # Expected: 98.6

# 3. Count Even Numbers in List
def count_evens(numbers):
    # TODO: Use a for loop to count how many numbers are even
    # See: Python for loop, modulo operator
    pass

# Tests
print(count_evens([1, 2, 3, 4]))          # Expected: 2
print(count_evens([2, 4, 6, 8]))          # Expected: 4
print(count_evens([1, 3, 5]))             # Expected: 0
print(count_evens([]))                   # Expected: 0

# 4. Replace Index in List (immutably)
def replace_index(lst, idx, value):
    # TODO: Return a new list with value at index idx replaced
    # See: Python list slicing
    pass

# Tests
print(replace_index([1, 2, 3], 1, 9))     # Expected: [1, 9, 3]
print(replace_index([5, 6, 7], 0, 10))    # Expected: [10, 6, 7]
print(replace_index([0, 1], 1, 5))        # Expected: [0, 5]
print(replace_index([9], 0, 3))           # Expected: [3]

# 5. Multiply All Elements (using loop)
def multiply_all(numbers):
    # TODO: Use a for loop to multiply all elements
    # See: Python for loop, accumulator pattern
    pass

# Tests
print(multiply_all([1, 2, 3, 4]))   # Expected: 24
print(multiply_all([5]))           # Expected: 5
print(multiply_all([]))            # Expected: 1
print(multiply_all([2, 0, 5]))     # Expected: 0

# More problems will follow in full version...
