#!/usr/bin/env python3
"""
simplified_net.py - CIDR Subnet Calculation (No Dependencies)

DESCRIPTION:
    Generates a reference table for CIDR subnet calculations without
    requiring pandas. Uses a simple ASCII table printer instead.

    This is a standalone version of net.py for environments where
    pandas is not available.

OUTPUT COLUMNS:
    - index: Row number (1-8)
    - cidr: CIDR notations for each octet
    - last_subnet: Last subnet address
    - networks: Number of networks
    - addresses: Addresses per network
    - use_range: Usable host range
    - gateway: Default gateway offset
    - network_ranges: First 10 network boundaries
    - next_network: Formula for calculating network

EXAMPLE:
    python simplified_net.py
    # Displays ASCII table with subnet reference data

REQUIRES:
    - Python 3.6+ (no external dependencies)

SEE ALSO:
    net.py - Same logic with pandas DataFrame output
"""

#import pandas as pd
def print_table(data):
    widths = {k: max(len(k), *(len(str(d[k])) for d in data)) for k in data[0]}
    print(" ".join(f"{k:{widths[k]}}" for k in widths))
    print("-" * sum(widths.values()))
    for row in data:
        print(" ".join(f"{str(row[k]):{widths[k]}}" for k in widths))

nets=[]
adrs=[]
networks=[]
magic_cidr=[]
for i in range(1,8+1):
    k=[]
    for j in range(1,4+1):
        k.append("/"+str(8*(j-1)+i))
    magic_cidr.append(k)
for i in range(8):
    nets.append(2**(i+1))
    adrs.append(2**(8-1-i))
for i in range(8):
    n={}
    n['index'] = i+1
    n['cidr'] = magic_cidr[i]
    n['last_subnet'] = 256-adrs[i]
    n['networks'] = nets[i]
    n['addresses'] = adrs[i]
    n['use_range'] = '[1:'+str(adrs[i]-2)+']'
    n['gateway'] = adrs[i]-1
    n['network_ranges'] = [i for i in range(0,256,adrs[i])][1:11]
    n['next_network'] = str(adrs[i]) + '*(n<=' + str(nets[i]-1) + ')'
    networks.append(n)

#print(pd.DataFrame(networks))
print_table(networks)
