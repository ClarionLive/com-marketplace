# Contributing to ClarionCOM Marketplace

Thank you for contributing to the ClarionCOM Marketplace! This guide explains how to submit your COM control to the registry.

## Prerequisites

Before submitting, ensure your control:

1. **Builds successfully** using ClarionCOM
2. **Uses Registration-Free COM** (no registry entries required)
3. **Has a public GitHub repository** with the source code
4. **Includes proper documentation** in the repository

## Submission Methods

### Method 1: ClarionCOM CLI (Recommended)

The easiest way to submit is through the ClarionCOM CLI:

```bash
# In your control project directory
/ClarionCOM
# Select "Submit to Marketplace"
```

This will:
- Validate your project structure
- Extract metadata from your .details, .methods, and .events files
- Generate manifest.yaml and api-docs.json
- Create a Pull Request to this repository

### Method 2: Manual Submission

1. **Fork this repository**

2. **Create your control folder**
   ```
   controls/
   └── YourControlName/
       ├── manifest.yaml
       └── api-docs.json
   ```

3. **Create manifest.yaml**
   ```yaml
   name: "Your Control Name"
   version: "1.0.0.0"
   description: "Full description of your control"
   short_description: "One-line summary"
   prog_id: "YourNamespace.YourControl"
   assembly_name: "YourControlAssembly"
   control_type: "standard"
   ui_library: "WinForms"

   repository:
     url: "https://github.com/yourusername/your-repo"
     branch: "main"

   author:
     name: "Your Name"
     github: "yourusername"

   compatibility:
     dotnet: "net472"
     clarion:
       min_version: "11.0"
       tested_versions: ["11.0", "12.0"]

   category: "UI Controls"
   tags: ["relevant", "tags"]

   changelog:
     - version: "1.0.0.0"
       date: "2025-01-11"
       changes: "Initial release"
   ```

4. **Create api-docs.json**
   ```json
   {
     "methods": [],
     "events": [],
     "properties": []
   }
   ```

5. **Submit a Pull Request**

## Validation Requirements

Your submission must pass these checks:

### manifest.yaml
- All required fields present
- Valid ProgID format (Namespace.ClassName)
- Repository URL is accessible
- Version follows 4-part format (MAJOR.MINOR.PATCH.BUILD)
- Category is from approved list

### api-docs.json
- Valid JSON format
- Methods, events, and properties arrays present
- Each entry has name and description

### Repository
- Public and accessible
- Contains valid ClarionCOM project structure
- README with usage instructions

## Categories

Use one of these categories:

| Category | Description |
|----------|-------------|
| UI Controls | Visual controls like buttons, grids, calendars |
| Data | Data handling, import/export, formatting |
| Utility | Helper controls, timers, system utilities |
| Integration | Third-party service integration |
| WebView2 | Browser-based controls using WebView2 |

## Updating Your Control

To update an existing control:

1. Update the version in manifest.yaml
2. Add a new changelog entry
3. Update api-docs.json if methods/events/properties changed
4. Submit a Pull Request with the changes

## Best Practices

### Documentation
- Include a comprehensive README in your repository
- Document all public methods, events, and properties
- Provide usage examples with Clarion code

### Versioning
- Use 4-part versioning (MAJOR.MINOR.PATCH.BUILD)
- Document breaking changes clearly
- Maintain backward compatibility when possible

### Testing
- Test with multiple Clarion versions
- Document any version-specific behavior
- Include sample Clarion projects if possible

## Getting Help

- Open an issue in this repository for submission problems
- Ask on the [ClarionLive](https://clarionlive.com) community
- Check existing controls for examples

## Code of Conduct

- Be respectful and constructive
- Follow the submission guidelines
- Report any issues with existing controls

## License

By submitting a control, you confirm that:
- You have the right to distribute the control
- Your repository includes a license file
- The control does not contain malicious code
