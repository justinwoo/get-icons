{ pkgs ? import <nixpkgs> {} }:

let
  node2nix = import ./node2nix.nix { inherit pkgs; };

  package = node2nix.package.override {
    preInstallPhases = "skipChromiumDownload";

    skipChromiumDownload = ''
      export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
    '';
  };

in pkgs.stdenv.mkDerivation {
  name = "get-icons";

  src = package;

  buildInputs = [ pkgs.makeWrapper ];

  installPhase = ''
    mkdir -p $out/bin

    ln -s $src/bin/get-icons $out/bin/get-icons
    wrapProgram $out/bin/get-icons \
      --set PUPPETEER_EXECUTABLE_PATH ${pkgs.chromium.outPath}/bin/chromium
  '';
}
