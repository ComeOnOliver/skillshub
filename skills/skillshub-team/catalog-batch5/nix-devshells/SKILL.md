# Nix + direnv

## .envrc
```bash
use flake
```

## flake.nix
```nix
{
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShells.default = pkgs.mkShell {
        packages = with pkgs; [ nodejs_20 pnpm python311 postgresql_16 redis ];
        env.DATABASE_URL = "postgresql://localhost/myapp";
      };
    });
}
```

## cd into directory → environment auto-activates
## Everyone on team gets exact same tools
## direnv allow once, then automatic
