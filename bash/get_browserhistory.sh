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
