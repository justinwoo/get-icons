#!/usr/bin/env bash

set -e

nix-build
./result/bin/get-icons oreshuba oreshuba
rm oreshuba
