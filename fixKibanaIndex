#!/bin/bash
# https://github[.]com/elastic/kibana/issues/13685 
curl -s -H "Content-Type: application/json" http://localhost:9200/_cat/indices \
 | awk '{ print $3 }' \
 | sort \
 | xargs -L 1 -I{} \
curl -s -XPUT -H "Content-Type: application/json" http://localhost:9200/{}/_settings \
-d '{"index.blocks.read_only_allow_delete": null}'
