# GPSBL

Personal script collection - GIAC/SANS training tools, security utilities, and practice exercises.

## Directory Structure

```
GPSBL/
├── python/           # Python scripts
├── powershell/       # PowerShell scripts
├── bash/             # Bash/shell scripts
├── web/              # HTML/JavaScript files
├── docs/             # Reference documentation
└── data/             # CSV, diagrams, PDFs
```

## Python Scripts

| File | Purpose | Status |
|------|---------|--------|
| `browser_history.py` | Extract browser history from Chrome/Safari/Firefox | Working |
| `extract_qa_v4.py` | Extract Q&A from PDFs (color-based answer detection) | Working |
| `flip_tables.py` | Parse fixed-width tabular data to JSON | Needs refactor (hardcoded path) |
| `electricslide.py` | Advanced tabular parser with sliding window | Has unused import |
| `gipity_parse.py` | Simple tabular parser | Working |
| `net.py` | CIDR networking calculations (pandas) | Working |
| `simplified_net.py` | CIDR calculations (no pandas) | Duplicate of net.py |
| `functional_python_practice.py` | 50 scaffolded practice questions | Educational |
| `PythonQuestions.py` | 10 practice questions | Educational |
| `PythonQ.py` | 20 practice questions | Educational |

## PowerShell Scripts

| File | Purpose | Status |
|------|---------|--------|
| `get-browserhistory.ps1` | Windows browser history collector | Working |
| `Get-NetStatObject.ps1` | Enhanced netstat with process info | Working |
| `get-netstatobject.ps1` | CIM-based netstat implementation | Duplicate |
| `Install-SSHServer.ps1` | SSH server setup + Chocolatey | Has unreachable code |
| `powershellgit.ps1` | GitLab API integration | **BUG: typo `fucntion`** |
| `active.ps1` | Windows activation + BitLocker | Working |
| `convertfrom-customstring.ps1` | Parse delimited strings | Working |
| `Send-NetworkData.ps1` | TCP data sender | Working |
| `Encode-Base64.ps1` | Base64 + clipboard functions | Misnamed (has Decode) |
| `Get-USB.ps1` | USB device enumeration | Working |
| `Compare-Baseline.ps1` | SQL Server baseline comparison | SQL injection risk |
| `Splat.ps1` | PowerShell splatting helper | Unclear purpose |

## Bash Scripts

| File | Purpose |
|------|---------|
| `get_browserhistory.sh` | macOS browser history collector |
| `ip_port.sh` | Display IP with listening ports |
| `velociraptor_install.sh` | Systemd service for HTTP server |
| `fixKibanaIndex.sh` | Fix Elasticsearch read-only indices |
| `Mongo2Elastic.sh` | MongoDB to Elasticsearch migration |

## Web Files

| File | Purpose |
|------|---------|
| `quiz-app2.html` | React quiz app with markdown import |
| `evil_cbt.js` | SCORM API manipulation script |

## Known Issues

See code review in commit history for detailed bug list.

### Critical Bugs to Fix
1. `powershell/powershellgit.ps1:26` - `fucntion` typo
2. `powershell/powershellgit.ps1:32` - Missing `Write-Host`
3. `python/flip_tables.py:16` - Hardcoded file path
4. `powershell/Install-SSHServer.ps1:49` - Code after `exit`

### Duplicates to Consolidate
- `net.py` / `simplified_net.py`
- `Get-NetStatObject.ps1` / `get-netstatobject.ps1`
- `PythonQ.py` / `PythonQuestions.py`
