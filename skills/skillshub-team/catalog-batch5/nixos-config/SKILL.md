# NixOS Configuration

## /etc/nixos/configuration.nix
```nix
{ config, pkgs, ... }: {
  system.stateVersion = "24.05";
  networking.hostName = "myserver";
  networking.firewall.allowedTCPPorts = [ 22 80 443 ];

  users.users.admin = {
    isNormalUser = true;
    extraGroups = [ "wheel" "docker" ];
    openssh.authorizedKeys.keys = [ "ssh-ed25519 AAAA..." ];
  };

  environment.systemPackages = with pkgs; [ vim git htop docker-compose ];

  services.openssh.enable = true;
  services.nginx = {
    enable = true;
    virtualHosts."myapp.com" = {
      forceSSL = true;
      enableACME = true;
      locations."/".proxyPass = "http://localhost:3000";
    };
  };

  virtualisation.docker.enable = true;
}
```

## Rebuild: sudo nixos-rebuild switch
## Rollback: sudo nixos-rebuild switch --rollback
## Generations: nix-env --list-generations