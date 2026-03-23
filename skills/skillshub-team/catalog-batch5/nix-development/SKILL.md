# Nix Dev Environments

## flake.nix
```nix
{
  inputs = { nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable"; flake-utils.url = "github:numtide/flake-utils"; };
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system}; in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [ nodejs_20 python3 rustc cargo postgresql redis ];
          shellHook = "echo 'Dev environment ready!'";
        };
      });
}
```

## Enter: nix develop (or direnv for auto-activation)

## shell.nix (non-flake)
```nix
{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell { buildInputs = [ pkgs.nodejs pkgs.yarn ]; }
```

## Key Benefits
- Reproducible: same packages everywhere (dev, CI, prod)
- Isolated: doesn't pollute global system
- Declarative: version-controlled dev dependencies
- Cross-platform: Linux and macOS
