###This code parses tabular data *automatically using the headers for keys
###TL;DR Tabular data to list of dictionaries ready for json

import itertools
import collections


###TODO: dynamic import
###TODO: Automatic test for headers
###TODO: Automatic expansion on lines that "aren't perfect"
###TODO: dynamic values for str_match or at least user defineable
###TODO: dynamic values for headers if duplicates
def find(s, ch):
     return [i for i, ltr in enumerate(s) if ltr == ch]

with open("desktop\\SSIDSECURITY2.txt","r") as f:
    list_arrays = f.readlines()

def freq_check(str_match,list_arrays):
    list_occurances = [find(i,str_match) for i in list_arrays]
    return list_occurances

def get_max_len(list_arrays):
    longest = len(max(list_arrays,key=len))
    return longest

def get_most_common(list_arrays):
    x = itertools.chain.from_iterable(list_arrays)
    most_common_char = collections.Counter(itertools.chain.from_iterable(x)).most_common()[0][0]
    return most_common_char 

str_match = get_most_common(list_arrays)
list_occurances = freq_check(str_match,list_arrays)
longest = get_max_len(list_arrays)

###Creates a list of tuples that dictate most common occurances of str_match
elements = sorted(collections.Counter(itertools.chain.from_iterable(list_occurances)).items(), key=lambda item: (-item[1], item[0]))
###Be able to tell what the max occurance is
max_occurance =  elements[0][1]

###Create a list from the common str_match
slicer = []
[slicer.append(list(i)) for i in elements if i[1] == max_occurance]

###FANCY *ISH* HERE
###enumerate over list of space stops
###Basically so we have a left and right bounding area
stops = []
for idx,element in enumerate(slicer):
    ###get the next element of the list
    nxt_element = slicer[(idx + 1) % len(slicer)][0]
    ###appeend the two elements to the list
    stops.append([element[0],nxt_element])
stops[len(stops)-1][1] = longest
stops[0][0] = 0


cols = []
for i in stops:
    for h in list_arrays:
       cols.append(h[i[0]:i[1]].strip())

idx_list = []
for idx,i in enumerate(cols):
    if i == '':
        idx_list.append(idx)

###Similar to lines 35 bounding areas
comp_list = []
for idx,element in enumerate(idx_list):
    nxt_element = idx_list[(idx+1)%len(idx_list)]
    comp_list.append([element,nxt_element])

comp_list.insert(0,[0,idx_list[0]])
comp_list.pop()

info = []
for i in comp_list:
    info.append(cols[i[0]:i[1]])

for idx,i in enumerate(info):
    if idx > 0:
        info[idx].pop(0)

###The code below creates a sorted list of all elments in the list
###We can then group those items from the [0] element creating a list of tuples 
###What it looks like is (0,'BSSID','BSSID'),...,(1,'BSSID','DE:AD:BE:EF')
###TODO: This code is slick, I question it's sustainability 
x_sorted_list = sorted(itertools.chain.from_iterable([[(idx,i[0],h) for idx,h in enumerate(i)] for i in info]))
x_list = []
###The code groups list by first element
###https://stackoverflow.com/questions/58403206/how-to-group-lists-inside-a-list-by-first-element
###Then appends that to the x_list
for i in [list(item[1]) for item in itertools.groupby(x_sorted_list, key=lambda x: x[0])]:
    x_obj = {}
    for h in i:
        x_obj[h[1]] = h[2]
    x_list.append(x_obj)
x_list.pop(0)
