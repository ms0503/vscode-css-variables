{
  inputs = {
    flake-parts = {
      inputs.nixpkgs-lib.follows = "nixpkgs";
      url = "github:hercules-ci/flake-parts";
    };
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    systems = {
      flake = false;
      url = "github:nix-systems/default";
    };
  };
  outputs =
    inputs@{ flake-parts, systems, ... }:
    let
      version = "2026-04-21";
    in
    flake-parts.lib.mkFlake { inherit inputs; } {
      perSystem =
        { lib, pkgs, ... }:
        {
          packages.default =
            let
              inherit (pkgs)
                buildNpmPackage
                findutils
                glib
                importNpmLock
                libsecret
                nodejs_latest
                pkg-config
                ;
            in
            buildNpmPackage {
              inherit version;
              inherit (importNpmLock) npmConfigHook;
              PKG_CONFIG_PATH = lib.makeSearchPathOutput "dev" "lib/pkgconfig" [
                glib
                libsecret
              ];
              nativeBuildInputs = [
                findutils
                pkg-config
              ];
              nodejs = nodejs_latest;
              npmDeps = importNpmLock {
                npmRoot = ./packages/css-variables-language-server;
              };
              npmPackFlags = [
                "--ignore-scripts"
              ];
              pname = "css-variables-language-server";
              preBuild = ''
                for dir in $(find . -type d -name node_modules); do
                  patchShebangs --host "$dir" &
                done
                wait
              '';
              src = ./packages/css-variables-language-server;
              unpackPhase = ''
                runHook preUnpack
                cp -arv "$src/"* .
                find . -type d -exec chmod u+w {} +
                runHook postUnpack
              '';
            };
        };
      systems = import systems;
    };
}
# vim: et sw=2
