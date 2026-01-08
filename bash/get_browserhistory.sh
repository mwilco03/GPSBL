#!/bin/bash
#===============================================================================
# get_browserhistory.sh - macOS Browser History Collector
#===============================================================================
#
# DESCRIPTION:
#   Collects browser history database files from all users on macOS and
#   packages them into a zip archive. Outputs retrieval commands for
#   CrowdStrike Falcon RTR (Real Time Response).
#
# SUPPORTED BROWSERS:
#   - Chrome/Chromium (History)
#   - Safari (History.db)
#   - Firefox (places.sqlite)
#
# USAGE:
#   ./get_browserhistory.sh       # Output human-readable instructions
#   ./get_browserhistory.sh api   # Output JSON for API integration
#
# OUTPUT:
#   Creates /tmp/$HOSTNAME.zip containing all browser history files
#
# NOTE:
#   Uses $HOST variable - should be $HOSTNAME for compatibility
#===============================================================================

zipFiles() { files=$( find /Users/*/Library -type f \( -iname 'History' -o -iname 'History.db' -o -iname 'places.sqlite' \) -exec zip /tmp/$HOST.zip {} + ) ; }

I() { cat <<EOF
------------------------------
Execute the following from the
Run commands prompt in falcon
------------------------------

 get "${1:-/tmp/$HOST.zip}" 

 rm "${1:-/tmp/$HOST.zip}" 

EOF
}

api() { cat <<EOF
{
    "more_commands": [
        "get ${1:-/tmp/$HOST.zip}",
        "rm ${1:-/tmp/$HOST.zip}"
    ]
}
EOF
}

zipFiles || exit 2
[[ -f ${archive:="/tmp/$HOST.zip"} ]] && ${1:-I} "$archive" || { echo "ERROR: Could not locate '$archive'" >/dev/stderr ; exit 1 ; }
