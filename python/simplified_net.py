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
