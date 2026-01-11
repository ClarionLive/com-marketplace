# ClarionCOM Marketplace Registry

Central registry of ClarionCOM controls for the Clarion development community.

## Overview

This repository serves as the official registry for ClarionCOM controls. Each control is documented with a manifest file containing metadata and API documentation that powers the [ClarionLive COM Marketplace](https://clarionlive.com/com-marketplace).

## For Control Developers

### Submitting Your Control

The easiest way to submit your control is through the ClarionCOM CLI:

1. Build your COM control project
2. Run `/ClarionCOM` and select "Submit to Marketplace"
3. Follow the prompts to generate and submit your manifest

Alternatively, you can manually create a PR:

1. Fork this repository
2. Create a folder under `controls/` with your control name
3. Add `manifest.yaml` with your control metadata
4. Add `api-docs.json` with method/event/property definitions
5. Submit a Pull Request

### Required Files

Each control folder must contain:

- **manifest.yaml** - Control metadata (see schema below)
- **api-docs.json** - Auto-generated API documentation

### manifest.yaml Schema

```yaml
name: "Control Display Name"
version: "1.0.0"
description: "Full description of what your control does"
short_description: "One-line description"
prog_id: "Namespace.ClassName"
assembly_name: "AssemblyName"
control_type: "standard"  # or "webview2"
ui_library: "WinForms"    # or "WebView2", "DevExpress", etc.

repository:
  url: "https://github.com/user/repo"
  branch: "main"

author:
  name: "Your Name"
  github: "your-github-username"

compatibility:
  dotnet: "net472"
  clarion:
    min_version: "11.0"
    tested_versions: ["11.0", "12.0"]

category: "UI Controls"  # or "Data", "Utility", "Integration", etc.
tags: ["calendar", "date-picker", "wpf"]

changelog:
  - version: "1.0.0"
    date: "2025-01-11"
    changes: "Initial release"
```

### api-docs.json Format

```json
{
  "methods": [
    {
      "name": "MethodName",
      "description": "What this method does",
      "parameters": [
        { "name": "param1", "type": "string", "description": "Parameter description" }
      ],
      "returns": { "type": "boolean", "description": "Return value description" }
    }
  ],
  "events": [
    {
      "name": "EventName",
      "description": "When this event fires",
      "parameters": [
        { "name": "sender", "type": "object" },
        { "name": "e", "type": "EventArgs" }
      ]
    }
  ],
  "properties": [
    {
      "name": "PropertyName",
      "type": "string",
      "description": "Property description",
      "readonly": false
    }
  ]
}
```

## For Users

Browse available controls at [clarionlive.com/com-marketplace](https://clarionlive.com/com-marketplace).

### Installing a Control

1. Find the control on the marketplace
2. Click the GitHub link to view the source repository
3. Clone the repository: `git clone <repo-url>`
4. Run `/ClarionCOM` and select "Build existing project"
5. The control will be compiled and copied to your Clarion installation
6. Use the control via OLE with the listed ProgID

## Categories

- **UI Controls** - Visual controls (buttons, grids, calendars, etc.)
- **Data** - Data handling, import/export, formatting
- **Utility** - Helper controls, timers, system integration
- **Integration** - Third-party service integration
- **WebView2** - Browser-based controls using WebView2

## Validation

All submissions are automatically validated:

- manifest.yaml must conform to the schema
- Repository URL must be accessible
- ProgID must be unique in the registry

## License

Individual controls are licensed by their respective authors. Check each control's repository for license information.
