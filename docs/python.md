### 1. **`collections.Counter`**
`Counter` is a dictionary subclass for counting hashable objects. 
It is particularly useful for counting elements in iterables, 
finding the most common elements, 
*and performing arithmetic operations on counters.*
#### Example 1: Counting Word Frequency in a Sentence
```python
from collections import Counter
sentence = "the quick brown fox jumps over the lazy dog the quick fox"
word_counts = Counter(sentence.split())
print(word_counts)
# Output: Counter({'the': 2, 'quick': 2, 'fox': 2, 'brown': 1, 'jumps': 1, 'over': 1, 'lazy': 1, 'dog': 1})
# The output is a dictionary so you can call .keys() and .values()
# Helpful when geting a sum of unique values 
```
#### Example 2: Finding the Most Common Elements
```python
from collections import Counter
letters = "aaabbbbccdde"
letter_counts = Counter(letters)
most_common = letter_counts.most_common(3)
print(most_common)
# Output: [('b', 4), ('a', 3), ('c', 2)]
# Output is a list of tuples so if you just wanted the most common
# most_common[0][0]
```
#### Example 3: Arithmetic Operations on Counters
```python
from collections import Counter
counter1 = Counter({"a":3, "b":1})
counter2 = Counter({"a":1, "b":2})
combined = counter1 + counter2  # Adds counts from both counters
subtracted = counter1 - counter2  # Subtracts counts from the second counter
print(combined)
# Output: Counter({'a': 4, 'b': 3})
print(subtracted)
# Output: Counter({'a': 2})
# You would use this if given a list or dict of two things 
# and were asked to do math on the uniqe elements
```
### 2. **`itertools`**
`itertools` provides powerful tools for creating and manipulating iterators.
It includes functions for permutations, 
combinations, infinite sequences, and more.
#### Example 1: Generating Permutations of a List
```python
import itertools
items = ['a', 'b', 'c']
permutations = list(itertools.permutations(items))
print(permutations)
# Output: [('a', 'b', 'c'), ('a', 'c', 'b'), ('b', 'a', 'c'), ('b', 'c', 'a'), ('c', 'a', 'b'), ('c', 'b', 'a')]
# Give me the posibilites for this list
# Donezo
```
#### Example 3: Cartesian Product of Two Iterables
```python
import itertools
colors = ['red', 'green']
sizes = ['S', 'M', 'L']
product = list(itertools.product(colors, sizes))
print(product)
# Output: [('red', 'S'), ('red', 'M'), ('red', 'L'), ('green', 'S'), ('green', 'M'), ('green', 'L')]
a,b,c=[range(i,10,i) for i in range(1,4)]
list(itertools.product(a,b,c))
# Again given two lists Mike Tython "Now kith"
# Seriously a bannger though you can pass in any amount of things
# It will iterate over all of them returning the internal tuple lists
```
### 4. **`re` (Regular Expressions)**
Regular expressions (`re`) are used for pattern matching in strings. 
It's incredibly powerful for searching, extracting, 
and replacing text based on patterns.
#### Example 1: Validating an Email Address
```python
import re
email = "test@example.com"
pattern = r'^\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
if re.match(pattern, email):
    print("Valid email")
else:
    print("Invalid email")
# Output: Valid email
```
#### Example 2: Extracting All Phone Numbers from a Text
```python
import re
text = "Contact us at 555-123-4567 or 555-987-6543."
phone_numbers = re.findall(r'\d{3}-\d{3}-\d{4}', text)
print(phone_numbers)
# Output: ['555-123-4567', '555-987-6543']
```
#### Example 3: Replacing All Occurrences of a Word
```python
import re
text = "The cat sat on the mat. The cat is happy."
updated_text = re.sub(r'cat', 'dog', text)
print(updated_text)
# Output: The dog sat on the mat. The dog is happy.
```
### 5. **`ipaddress`**
The `ipaddress` module provides the ability to create,
manipulate, and operate on IPv4 and IPv6 addresses and networks.
#### Example 1: Validating an IP Address
```python
import ipaddress
ip = "192.168.0.1"
try:
    ip_obj = ipaddress.ip_address(ip)
    print(f"{ip} is a valid IP address.")
except ValueError:
    print(f"{ip} is not a valid IP address.")
# Output: 192.168.0.1 is a valid IP address.
```
#### Example 2: Checking if an IP Address is Part of a Network
```python
import ipaddress
ip = ipaddress.ip_address("192.168.0.1")
network = ipaddress.ip_network("192.168.0.0/24")
print(ip in network)
# Output: True
```
#### Example 3: Iterating Over All Addresses in a Network
```python
import ipaddress

network = ipaddress.ip_network("192.168.0.0/29")
for ip in network:
    print(ip)
# Output:
# 192.168.0.0
# 192.168.0.1...
```
### 6. **`textwrap`**
The `textwrap` module provides utilities for formatting text, particularly for wrapping and filling text to fit within a specified width.
#### Example 1: Wrapping Text to a Specified Width
```python
import textwrap
text = "This is a long piece of text that needs to be wrapped."
wrapped_text = textwrap.fill(text, width=20)
print(wrapped_text)
# Output:
# This is a long piece
# of text that needs
# to be wrapped.
```
#### Example 2: Dedenting Text
```python
import textwrap
text = """
    This is indented text.
    It needs to be dedented.
"""
dedented_text = textwrap.dedent(text).strip()
print(dedented_text)
# Output:
# This is indented text.
# It needs to be dedented.
```
#### Example 3: Shortening Text with an Ellipsis
```python
import textwrap
text = "This is a very long sentence that needs to be shortened."
shortened_text = textwrap.shorten(text, width=30, placeholder="...")
print(shortened_text)
# Output: This is a very long...
```

- **`collections.Counter`**: Counting elements, finding the most common, performing arithmetic operations on counters.
- **`itertools`**: Generating permutations, infinite sequences, cartesian products.
- **`re` (regex)**: Validating patterns, extracting text, replacing text.
- **`ipaddress`**: Validating IPs, checking membership in a network, iterating over addresses.
- **`textwrap`**: Wrapping text, dedenting, shortening text with ellipses.
