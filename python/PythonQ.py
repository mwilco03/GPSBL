# Functional Python – 20 Scaffolded Practice Questions
# Goal: Learn functional thinking, reuse, and clean Python patterns

from functools import reduce


# 1. Pure Function – Add Two Numbers
def add(a, b):
    # TODO: Add two numbers
    # HINT: Use return a + b
    pass

print(add(3, 4))  # Expected: 7


# 2. Convert Celsius to Fahrenheit
def c_to_f(celsius):
    # TODO: Use formula F = C * 9/5 + 32
    pass

print(c_to_f(0))  # Expected: 32


# 3. Format Temperature
def format_fahrenheit(f):
    # TODO: Return "Temperature: XX°F"
    # HINT: Use f-strings
    pass

print(format_fahrenheit(86))  # Expected: "Temperature: 86°F"


# 4. Square All Numbers (map)
def square_all(numbers):
    # TODO: Use map and lambda to square each number
    pass

print(square_all([1, 2, 3]))  # Expected: [1, 4, 9]


# 5. Filter Positive Numbers
def filter_positive(numbers):
    # TODO: Use filter to return numbers > 0
    pass

print(filter_positive([-2, 0, 5, 9]))  # Expected: [5, 9]


# 6. Multiply All Numbers (reduce)
def product(numbers):
    # TODO: Use reduce to multiply all numbers
    pass

print(product([2, 3, 4]))  # Expected: 24


# 7. Double a Value Twice
def apply_twice(f, x):
    # TODO: Call f on x, then again
    pass

print(apply_twice(lambda x: x * 2, 3))  # Expected: 12


# 8. Replace Element in List (immutably)
def replace_index(lst, idx, val):
    # TODO: Use slicing to replace without mutating
    pass

print(replace_index([1, 2, 3], 1, 10))  # Expected: [1, 10, 3]


# 9. Make Adder Function
def make_adder(n):
    # TODO: Return function that adds n to its input
    pass

add10 = make_adder(10)
print(add10(5))  # Expected: 15


# 10. Recursive List Sum
def recursive_sum(lst):
    # TODO: Base case for empty list
    # TODO: Return first element + recursive sum of rest
    pass

print(recursive_sum([1, 2, 3, 4]))  # Expected: 10


# 11. Clean and Join Strings
def clean_and_join(words):
    # TODO: Filter empty strings, capitalize, join with commas
    pass

print(clean_and_join(['', 'hello', 'world']))  # Expected: 'HELLO,WORLD'


# 12. Count Vowels
def count_vowels(s):
    # TODO: Use filter or list comprehension to count vowels
    pass

print(count_vowels("functional"))  # Expected: 4


# 13. Palindrome Checker
def is_palindrome(s):
    # TODO: Check if string is equal to its reverse
    pass

print(is_palindrome("radar"))  # Expected: True
print(is_palindrome("chatgpt"))  # Expected: False


# 14. List of Even Numbers (List Comprehension)
def even_numbers(n):
    # TODO: Return list of even numbers from 0 to n
    pass

print(even_numbers(10))  # Expected: [0, 2, 4, 6, 8, 10]


# 15. Compose Two Functions
def compose(f, g):
    # TODO: Return a new function h such that h(x) = f(g(x))
    pass

double = lambda x: x * 2
increment = lambda x: x + 1
# Compose: double after increment
composed = compose(double, increment)
print(composed(3))  # Expected: 8


# 16. Safe Division
def safe_divide(a, b):
    # TODO: Return a / b, or 'undefined' if b == 0
    pass

print(safe_divide(10, 2))  # Expected: 5
print(safe_divide(10, 0))  # Expected: 'undefined'


# 17. Get Unique Elements (No Sets)
def unique_elements(lst):
    # TODO: Return a list of unique elements preserving order
    # HINT: Use a loop or reduce with accumulator
    pass

print(unique_elements([1, 2, 2, 3, 1]))  # Expected: [1, 2, 3]


# 18. Count Occurrences
def count_occurrences(lst):
    # TODO: Return dict with count of each element
    # HINT: Use reduce or loop with a dict
    pass

print(count_occurrences(['a', 'b', 'a']))  # Expected: {'a': 2, 'b': 1}


# 19. Flatten a List of Lists
def flatten(nested):
    # TODO: Flatten list of lists using reduce or list comprehension
    pass

print(flatten([[1, 2], [3, 4], [5]]))  # Expected: [1, 2, 3, 4, 5]


# 20. Zip Two Lists into Pairs
def zip_lists(a, b):
    # TODO: Combine two lists element-wise into tuples
    # HINT: Use built-in zip()
    pass

print(zip_lists([1, 2, 3], ['a', 'b', 'c']))  # Expected: [(1, 'a'), (2, 'b'), (3, 'c')]
