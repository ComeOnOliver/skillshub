# Slack GIF Creator

A toolkit providing utilities and knowledge for creating animated GIFs optimized for Slack.

## Overview

This skill enables Claude to create animated GIFs that meet Slack's technical requirements, including proper dimensions, file sizes, and optimization parameters. It's particularly useful for generating custom emoji GIFs, message GIFs, and animated reactions.

## Features

- **Slack Compliance**: Automatic validation against Slack's requirements (dimensions, file size, color palette)
- **Composable Animation Primitives**: Build complex animations from simple concepts (shake, pulse, bounce, spin, etc.)
- **Optimization Tools**: Built-in utilities to reduce file size while maintaining quality
- **Custom Graphics**: Draw from scratch using PIL primitives (no emoji font dependencies)

## Slack Requirements

- **Emoji GIFs**: 128x128 pixels, under 64KB
- **Message GIFs**: 480x480 pixels, under 2MB
- **Frame Rate**: 10-30 FPS (lower rates = smaller files)
- **Color Palette**: 48-128 colors (fewer = smaller files)

## Usage

The skill activates when users request animated GIFs for Slack:

```
"Make me a GIF for Slack of a star pulsing"
"Create a Slack emoji of a heart bouncing"
"Generate an animated GIF of text sliding in for Slack"
```

## Animation Concepts

The skill supports various animation techniques:

- **Shake/Vibrate**: Oscillating motion
- **Pulse/Heartbeat**: Rhythmic scaling
- **Bounce**: Physics-based motion
- **Spin/Rotate**: Circular motion
- **Fade**: Transparency transitions
- **Slide**: Movement across the frame
- **Zoom**: Scaling effects
- **Particle Burst**: Exploding elements

## Dependencies

```bash
pip install pillow imageio numpy
```

Or use the included `requirements.txt`:

```bash
pip install -r requirements.txt
```

## Core Utilities

- **GIFBuilder**: Assembles frames with optimization
- **Validators**: Checks compliance with Slack requirements
- **Easing Functions**: Provides smooth motion curves
- **Frame Helpers**: Convenience functions for common tasks

## Installation

Copy this skill to your Claude Code skills directory:

```bash
cp -r slack-gif-creator ~/.claude/skills/
```

## Original Source

This skill is from Anthropic's official skills repository:

[anthropics/skills - slack-gif-creator](https://github.com/anthropics/skills/tree/main/skills/slack-gif-creator)

## License

See [LICENSE.txt](LICENSE.txt) for complete terms. Licensed under the Apache License, Version 2.0.
