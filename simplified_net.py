import pandas as pd
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
pd.set_option('display.max_columns', None) 
print(pd.DataFrame(networks))
