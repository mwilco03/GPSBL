
import pandas as pd
MAGIC = 8
##Cidr nets
#Create 4x8 matrix
#adding 8 to the (i)ndex
#starting @ 1
mgk_net = [["/" + str(MAGIC * (j - 1) + i) for j in range(1, int(MAGIC / 2) + 1)] for i in range(1, MAGIC + 1)]
##Nets&Addresses
#loop over range
#+1 for networks
#-1 for addresses
nets, adrs = zip(*[(2 ** (i + 1), 2 ** (MAGIC - i - 1)) for i in range(MAGIC)])
networks = []
for i in range(MAGIC):
    n = {}
    n['index'] = i + 1
    n['cidr'] = mgk_net[i]
    #Silly 8*(8*8/2) == 256
    #256-addresses == last subnet
    n['last_subnet'] = MAGIC * int(MAGIC * MAGIC / 2) - adrs[i]
    n['nets'] = nets[i]
    n['addresses'] = adrs[i]
    ##Usable range
    #addresses-2
    n['range'] = f'[1:{adrs[i] - 2}]'
    ##Gateway
    #addresses-1
    n['gateway'] = adrs[i] - 1
    ##Next Network
    #for range 0..256 step over number of addresses
    #only display 10 iterations [1:11]
    n['next_network'] = [x for x in range(0, 256, adrs[i])][1:11]
    ##Net calc
    #given the problem:
    #whats the first usabe ip of 12.190.185.10/18
    #We know /18 is in the 3rd column
    #So we examine 3rd octet 185
    #So /18 has 4 options for ranges
    #[1,64,128,192] 185>128 and 185<192
    #So selecting 12.190.128.1 as the first usable address
    n['network_calc'] = f'{adrs[i]}*(n<={nets[i] - 1})'
    networks.append(n)
df_networks = pd.DataFrame(networks)
print(df_networks)
