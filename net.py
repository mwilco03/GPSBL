magic = 8
nets=[]
adrs=[]
networks=[]
mgk_net=[["/"+str(magic * (j-1) + i) for j in range(1, int(magic/2) +1)] for i in range(1, magic +1)]
for i in range(magic):
    nets.append(2**(i+1))
    adrs.append(2**i)
adrs.reverse()
for i in range(magic):
    n={}
    n['index'] = i+1
    n['cidr'] = mgk_net[i]
    n['ls'] = magic*int(magic*magic/2)-adrs[i]
    n['nets'] = nets[i]
    n['adrs'] = adrs[i]
    n['rng'] = '[1:'+str(adrs[i]-2)+']'
    n['gw'] = adrs[i]-1
    n['nn'] = str(adrs[i]) + '*(n<=' + str(nets[i]-1) + ')'
    networks.append(n)


import pandas as pd
print(pd.DataFrame(networks))
