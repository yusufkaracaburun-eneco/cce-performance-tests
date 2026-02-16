# DevContainer Rebuild Instructions

If you encounter the error: `unable to find user node: no matching entries in passwd file`, you need to rebuild your devcontainer.

## Quick Fix

1. **Remove the existing container:**
   - Open VS Code Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
   - Run: `Dev Containers: Rebuild Container`
   - Or manually: `Dev Containers: Remove Dev Container` then reopen

2. **Rebuild from scratch:**
   - Command Palette → `Dev Containers: Rebuild Container Without Cache`

## Why This Happens

This error occurs when:
- The container was built before features (k6/xk6) were added
- The container is in an inconsistent state
- Features need to be installed fresh

## Prerequisites

The devcontainer includes the following features:
- **k6** - Performance testing tool
- **xk6** - Tool for building custom k6 binaries
- **Go** - Required by xk6 to compile custom k6 extensions

All features are automatically installed when the container is built.

## Verification

After rebuilding, verify everything works:

```bash
# Check k6 is installed
k6 version

# Check xk6 is installed  
xk6 version

# Check Go is installed (required for xk6 builds)
go version

# Run a test
npm test
```

## Troubleshooting

### xk6 Build Fails with "go toolchain not found"

If you see this error when building a custom k6 binary:
- Ensure the devcontainer has been rebuilt with the latest configuration
- The Go feature should be automatically installed via devcontainer.json
- Verify Go is installed: `go version`
- If Go is missing, rebuild the container: `Dev Containers: Rebuild Container Without Cache`
