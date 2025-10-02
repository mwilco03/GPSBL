[Unit]
Description=Python simple HTTP server on /share port 9090
After=network-online.target
Wants=network-online.target

[Service]
# Adjust the path to python3 if needed (check with: which python3)
ExecStart=/usr/bin/python3 -m http.server 9090 --directory /share
# Or, if you prefer WorkingDirectory:
# WorkingDirectory=/share
# ExecStart=/usr/bin/python3 -m http.server 9090

User=pyhttp
Group=pyhttp

# Restart on crashes or if killed
Restart=on-failure
RestartSec=2

# Hardening (safe to keep; loosen if you hit permission issues)
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=true
ReadWritePaths=/share
RestrictAddressFamilies=AF_INET AF_INET6
CapabilityBoundingSet=
LockPersonality=true
MemoryDenyWriteExecute=true

# Log to journal (view with journalctl -u py-http-server)
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
