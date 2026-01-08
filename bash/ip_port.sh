#!/bin/bash
#===============================================================================
# ip_port.sh - Display Local IP Addresses with Listening Ports
#===============================================================================
#
# DESCRIPTION:
#   Shows all local IPv4 addresses paired with listening TCP/UDP ports
#   (excluding SSH port 22). Useful for quickly finding service URLs
#   after starting a local server.
#
# OUTPUT:
#   Connect to host on http://192.168.1.100:8080
#   Connect to host on http://10.0.0.5:8080
#
# EXAMPLE:
#   # Start a web server, then run this to see access URLs
#   python3 -m http.server 8080 &
#   ./ip_port.sh
#
# REQUIRES:
#   - ip (iproute2)
#   - ss (socket statistics)
#===============================================================================

ip a | grep inet |grep -vE '(inet6|host)' | awk '{print $2}' | cut -d"/" -f1 | while read line ; do echo "Connect to host on http://${line}$(ss -pluwnt | grep *: | grep -v :22 | awk '{print $5}'| sed 's/*//g' )" ; done
