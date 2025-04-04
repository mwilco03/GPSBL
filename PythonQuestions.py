# 🐍 Functional-Style Python Practice for Beginners
# Focus: Pure functions, loops, recursion, immutability — NO lambdas yet
# Each function includes:
# - Clear TODOs
# - References to look up (e.g., "See: Python for loop")
# - 4 test cases with expected outputs

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


# 6. Uppercase and Join Strings
def format_names(names):
    # TODO: Use a for loop to:
    #   - remove empty strings
    #   - convert names to uppercase
    #   - join with commas
    # See: Python string.upper(), list.append(), str.join()
    pass

# Tests
print(format_names(['alice', 'bob']))           # Expected: 'ALICE,BOB'
print(format_names(['', 'charlie', 'david']))   # Expected: 'CHARLIE,DAVID'
print(format_names(['eve']))                    # Expected: 'EVE'
print(format_names(['']))                       # Expected: ''


# 7. Reverse a String
def reverse_string(s):
    # TODO: Use a while loop or slicing to reverse the string
    # See: Python string slicing or while loops
    pass

# Tests
print(reverse_string('hello'))      # Expected: 'olleh'
print(reverse_string('a'))          # Expected: 'a'
print(reverse_string(''))           # Expected: ''
print(reverse_string('Python'))     # Expected: 'nohtyP'


# 8. Check for Palindrome
def is_palindrome(s):
    # TODO: Compare string with its reverse
    # See: Python string slicing
    pass

# Tests
print(is_palindrome('radar'))       # Expected: True
print(is_palindrome('hello'))       # Expected: False
print(is_palindrome(''))            # Expected: True
print(is_palindrome('level'))       # Expected: True


# 9. Count Vowels in String
def count_vowels(s):
    # TODO: Use a for loop to count vowels (a, e, i, o, u)
    # See: Python membership test: `in`
    pass

# Tests
print(count_vowels('hello'))        # Expected: 2
print(count_vowels('sky'))          # Expected: 0
print(count_vowels('aeiou'))        # Expected: 5
print(count_vowels('AEiOu'))        # Expected: 5


# 10. Recursive Sum of List (Functional Recursion)
def recursive_sum(lst):
    # TODO: Use recursion:
    # - Base case: empty list → return 0
    # - Recursive case: return first element + recursive_sum(rest)
    # See: Python recursion, slicing
    pass

# Tests
print(recursive_sum([1, 2, 3, 4]))   # Expected: 10
print(recursive_sum([]))            # Expected: 0
print(recursive_sum([5]))           # Expected: 5
print(recursive_sum([10, -10, 5]))  # Expected: 5
