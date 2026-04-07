---
name: extract-design-ui
description: Extract the complete UI aesthetic and design system of any website into a structured JSON interpretation. Captures colors, typography, spacing, shadows, borders, animations, layout patterns, component styles, and interaction behaviors. Use this when the user wants to "extract design", "capture UI aesthetic", "reverse-engineer design system", "analyze website styling", or "get design tokens" from any website. Provide the target URL as an argument.
argument-hint: "<url>"
user-invocable: true
---

# Extract Design UI

You are about to perform a **complete forensic analysis** of the design aesthetic at **$ARGUMENTS** and produce a comprehensive JSON interpretation of its UI design system.

This is not a simple color picker or font detector. You are extracting the **entire visual language** of the website — every design decision, every micro-interaction, every spacing choice, every aesthetic nuance — and encoding it into a structured, machine-readable format that can be used to understand, replicate, or analyze the site's design DNA.

## Pre-Flight

1. **Chrome MCP is required.** Test it immediately. If it's not available, stop and tell the user to enable it — this skill cannot work without browser automation.
2. Create output directory if it doesn't exist: `docs/design-extraction/`
3. Prepare the extraction script utilities — you'll run multiple JavaScript snippets in Chrome MCP throughout the process.

## The Output: Complete Design JSON Schema

Your final deliverable is a JSON file at `docs/design-extraction/design-system.json` following this complete schema. Every extraction you perform maps to a field in this JSON. Do not skip any top-level section — if a value is not found, use `null` or an empty array/object as appropriate.

```json
{
  "metadata": {
    "url": "string",
    "extractedAt": "ISO timestamp",
    "viewportWidth": "number",
    "viewportHeight": "number",
    "userAgent": "string"
  },
  "designSystem": {
    "colors": {
      "primaries": [{"name": "string", "value": "hex", "usage": ["string"]}],
      "neutrals": [{"name": "string", "value": "hex", "usage": ["string"]}],
      "accents": [{"name": "string", "value": "hex", "usage": ["string"]}],
      "semantic": {
        "success": "hex",
        "error": "hex", 
        "warning": "hex",
        "info": "hex"
      },
      "gradients": [{"name": "string", "value": "css-gradient", "usage": "string"}],
      "backgrounds": [{"element": "string", "value": "hex|gradient"}]
    },
    "typography": {
      "fontFamilies": [{"name": "string", "faces": ["string"], "source": "google|system|custom"}],
      "fontSizes": {
        "min": "rem",
        "max": "rem",
        "scale": [{"name": "string", "size": "rem", "lineHeight": "number", "letterSpacing": "em", "fontWeight": "number"}]
      },
      "headings": {
        "h1": {"size": "rem", "weight": "number", "lineHeight": "number", "letterSpacing": "em", "marginBottom": "rem"},
        "h2": {"size": "rem", "weight": "number", "lineHeight": "number", "letterSpacing": "em", "marginBottom": "rem"},
        "h3": {"size": "rem", "weight": "number", "lineHeight": "number", "letterSpacing": "em", "marginBottom": "rem"},
        "h4": {"size": "rem", "weight": "number", "lineHeight": "number", "letterSpacing": "em", "marginBottom": "rem"},
        "h5": {"size": "rem", "weight": "number", "lineHeight": "number", "letterSpacing": "em", "marginBottom": "rem"},
        "h6": {"size": "rem", "weight": "number", "lineHeight": "number", "letterSpacing": "em", "marginBottom": "rem"}
      },
      "body": {
        "size": "rem",
        "weight": "number",
        "lineHeight": "number",
        "color": "hex"
      },
      "small": {"size": "rem", "weight": "number", "lineHeight": "number", "color": "hex"},
      "link": {"color": "hex", "hoverColor": "hex", "textDecoration": "string"}
    },
    "spacing": {
      "baseUnit": "rem",
      "scale": [{"name": "string", "value": "rem"}],
      "containerPadding": {"mobile": "rem", "tablet": "rem", "desktop": "rem"},
      "sectionGaps": {"between": "rem", "within": "rem"}
    },
    "layout": {
      "gridSystem": {"columns": "number", "gutter": "rem", "margin": "rem", "breakpoints": {"mobile": "px", "tablet": "px", "desktop": "px"}},
      "maxWidths": {"container": "rem", "text": "rem", "content": "rem"},
      "zIndexLayers": [{"name": "string", "value": "number"}],
      "positioningStrategy": "relative|absolute|fixed|sticky"
    },
    "borders": {
      "radius": {
        "none": "rem",
        "sm": "rem",
        "md": "rem",
        "lg": "rem",
        "xl": "rem",
        "full": "rem"
      },
      "widths": {"thin": "px", "normal": "px", "thick": "px"},
      "styles": ["solid", "dashed", "dotted"]
    },
    "shadows": {
      "sm": {"value": "css-shadow", "usage": ["string"]},
      "md": {"value": "css-shadow", "usage": ["string"]},
      "lg": {"value": "css-shadow", "usage": ["string"]},
      "xl": {"value": "css-shadow", "usage": ["string"]},
      "inner": {"value": "css-shadow", "usage": ["string"]},
      "glow": {"value": "css-shadow", "usage": ["string"]}
    },
    "animation": {
      "durations": {"instant": "ms", "fast": "ms", "normal": "ms", "slow": "ms", "verySlow": "ms"},
      "easing": {"default": "cubic-bezier", "enter": "cubic-bezier", "exit": "cubic-bezier", "spring": "cubic-bezier"},
      "transitions": [{"property": "string", "duration": "ms", "easing": "string"}]
    },
    "interactions": {
      "hover": {"scale": "number", "opacity": "number", "transition": "string"},
      "focus": {"outlineWidth": "px", "outlineColor": "hex", "offset": "px"},
      "active": {"scale": "number", "opacity": "number"},
      "loading": {"spinnerType": "string", "skeletonColor": "hex"}
    }
  },
  "components": [
    {
      "name": "string",
      "selector": "string",
      "screenshot": "string",
      "styles": {
        "container": {},
        "inner": {},
        "text": {},
        "images": {}
      },
      "variants": [
        {
          "name": "string",
          "styles": {},
          "behavior": "string"
        }
      ],
      "breakpoints": {
        "mobile": {},
        "tablet": {},
        "desktop": {}
      }
    }
  ],
  "patterns": {
    "navigation": {
      "type": "top|side|bottom|hybrid",
      "behavior": "static|sticky|fixed|scroll-hide|scroll-appear",
      "items": "number",
      "mobileBehavior": "hamburger|tab-bar|bottom-nav"
    },
    "cards": {
      "count": "number",
      "layout": "grid|flex|masonry",
      "hoverEffect": "lift|shadow|scale|border",
      "contentStructure": ["image", "title", "description", "cta"]
    },
    "forms": {
      "inputStyle": "outlined|filled|minimal|underlined",
      "borderRadius": "rem",
      "validationStyle": "inline|tooltip|summary"
    },
    "modals": {
      "triggerType": "click|hover|auto",
      "animation": "fade|slide|scale|none",
      "backdropBlur": "boolean",
      "closeBehavior": "click-outside|escape-key|close-button"
    }
  },
  "designPrinciples": {
    "overallVibe": ["string"],
    "references": ["string"],
    "uniqueElements": ["string"],
    "accessibility": {
      "contrastRatios": {"minimum": "number", "violations": ["string"]},
      "focusIndicators": "boolean",
      "ariaLabels": "boolean"
    },
    "performance": {
      "imageOptimization": "boolean",
      "fontLoading": "swap|optional|fallback",
      "criticalCSS": "inline|external"
    }
  }
}