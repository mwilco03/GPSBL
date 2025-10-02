#!/usr/bin/env bash
set -euo pipefail

# ------------------ Minimal settings ------------------
VR_HOST="${VR_HOST:-your.public.dns.or.ip}"     # Used only for printed hints
VR_ADMIN_USER="${VR_ADMIN_USER:-vr-admin}"
: "${VR_ADMIN_PASS:?Set VR_ADMIN_PASS in env (won't be echoed)}"
VR_GUI_PORT="${VR_GUI_PORT:-8889}"              # admin GUI (HTTPS)
VR_FRONTEND_PORT="${VR_FRONTEND_PORT:-8000}"    # client comms (HTTPS)
# ------------------------------------------------------

if [[ "$EUID" -ne 0 ]]; then
  echo "Please run as root (sudo)." >&2
  exit 1
fi

echo "[*] Installing prerequisites..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl jq ca-certificates coreutils procps

echo "[*] Ensure velociraptor user and dirs (idempotent)..."
id -u velociraptor &>/dev/null || useradd --system --home /var/lib/velociraptor --shell /usr/sbin/nologin velociraptor
install -d -o velociraptor -g velociraptor /var/lib/velociraptor
install -d -o velociraptor -g velociraptor /var/log/velociraptor
install -d -o root -g root /etc/velociraptor

echo "[*] Get Velociraptor linux-amd64 binary (latest)..."
if ! command -v velociraptor >/dev/null 2>&1; then
  API="https://api.github.com/repos/Velocidex/velociraptor/releases/latest"
  # try glibc amd64, then musl as fallback
  get_url() {
    curl -fsSL "$API" \
    | jq -r '.assets[] | .name + " " + .browser_download_url' \
    | awk '
      /linux-amd64[^a-zA-Z0-9]/ || /linux-amd64$/ {print $2; exit}
      /linux-amd64-musl/ {print $2; exit}
    '
  }
  URL="$(get_url || true)"
  [[ -n "${URL:-}" ]] || { echo "Could not find a linux-amd64 asset."; exit 1; }

  TMPBIN="$(mktemp)"
  curl -fL --retry 3 --retry-delay 2 "$URL" -o "$TMPBIN"

  # If it's a single binary, great; if it's an archive, try to extract
  if file "$TMPBIN" | grep -qi 'zip archive'; then
    apt-get install -y unzip
    TMPDIR="$(mktemp -d)"
    unzip -q "$TMPBIN" -d "$TMPDIR"
    BINPATH="$(find "$TMPDIR" -maxdepth 1 -type f -name 'velociraptor*' | head -n1)"
    [[ -n "$BINPATH" ]] || { echo "No binary found in zip."; exit 1; }
    install -m 0755 "$BINPATH" /usr/local/bin/velociraptor
    rm -rf "$TMPDIR" "$TMPBIN"
  else
    install -m 0755 "$TMPBIN" /usr/local/bin/velociraptor
    rm -f "$TMPBIN"
  fi
else
  echo "    velociraptor already installed; skipping download."
fi

CFG="/etc/velociraptor/server.config.yaml"
if [[ ! -f "$CFG" ]]; then
  echo "[*] Generate default server config..."
  velociraptor config generate > "$CFG"
else
  echo "    Using existing $CFG"
fi

echo "[*] Adjust bind addresses and ports (non-destructive where possible)..."
# Bind GUI/Frontend to 0.0.0.0 so it’s reachable, keep everything else intact.
# Only modify the specific keys; don’t replace hostnames blindly.
awk -v GUI_PORT="$VR_GUI_PORT" -v FE_PORT="$VR_FRONTEND_PORT" '
  BEGIN{in_gui=0;in_fe=0}
  /^GUI:/      {in_gui=1;in_fe=0}
  /^Frontend:/ {in_fe=1;in_gui=0}
  {
    if(in_gui && $1=="bind_address:"){ $2="0.0.0.0" }
    if(in_gui && $1=="bind_port:"){ $2=GUI_PORT }
    if(in_fe && $1=="bind_address:"){ $2="0.0.0.0" }
    if(in_fe && $1=="bind_port:"){ $2=FE_PORT }
    print
  }
' "$CFG" > "${CFG}.tmp" && mv "${CFG}.tmp" "$CFG"

chown -R velociraptor:velociraptor /etc/velociraptor /var/lib/velociraptor /var/log/velociraptor
chmod 640 "$CFG" || true

echo "[*] Create/ensure admin user..."
# Add or reset password idempotently by deleting and re-adding the user, which is simpler operationally.
if velociraptor --config "$CFG" user show | awk '{print $1}' | grep -qx "$VR_ADMIN_USER"; then
  velociraptor --config "$CFG" user delete "$VR_ADMIN_USER" || true
fi
velociraptor --config "$CFG" user add "$VR_ADMIN_USER" --role administrator "$VR_ADMIN_PASS"

echo "[*] Install/refresh systemd service..."
cat >/etc/systemd/system/velociraptor.service <<'UNIT'
[Unit]
Description=Velociraptor Server
Documentation=https://docs.velociraptor.app/
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=velociraptor
Group=velociraptor
ExecStart=/usr/local/bin/velociraptor --config /etc/velociraptor/server.config.yaml frontend
WorkingDirectory=/var/lib/velociraptor
Restart=always
RestartSec=5
LimitNOFILE=20000
Environment=LANG=en_US.UTF-8

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable --now velociraptor

echo "[*] Generate client config (root org)..."
velociraptor config client --org "root" --config "$CFG" > /etc/velociraptor/client.root.config.yaml
chown velociraptor:velociraptor /etc/velociraptor/client.root.config.yaml
chmod 640 /etc/velociraptor/client.root.config.yaml

echo "[*] Build Debian client package (best-effort; OK if skipped)..."
if ! command -v dpkg >/dev/null 2>&1; then
  echo "    dpkg not found; skipping .deb build."
else
  ( cd /root || cd ~
    set +e
    velociraptor debian client --config /etc/velociraptor/client.root.config.yaml
    set -e
  )
fi

echo
echo "==================== RUNNING ===================="
systemctl --no-pager --full status velociraptor || true
echo
echo "Admin GUI (self-signed TLS):  https://${VR_HOST}:${VR_GUI_PORT}"
echo "Login with user:              ${VR_ADMIN_USER}"
echo "Client config:                /etc/velociraptor/client.root.config.yaml"
echo "================================================"
