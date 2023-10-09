#!/bin/bash

BASE_URL="https://db.serverbee.app/cli"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
# No Color
NC='\033[0m'

OS="$(uname)"
ARCH="$(uname -m)"

if [[ "$OS" == "Linux" ]]; then
    echo -e "Your operating system is ${GREEN}Linux${NC}"
    tuple="unknown-linux-musl"
elif [[ "$OS" == "Darwin" ]]; then
    echo -e "Your operating system is ${GREEN}MacOS${NC}"
    tuple="apple-darwin"
else
    echo -e "Your operating system is ${RED}not identified${NC}" && exit 1
fi

if [[ "$ARCH" == "x86_64" ]]; then
    echo -e "Your architecture is ${GREEN}AMD${NC}"
    ARCH="x86_64"
elif [[ "$ARCH" == "arm64" || "$ARCH" == *"armv"* ]]; then
    echo -e "Your architecture is ${GREEN}ARM${NC}"
    ARCH="aarch64"
else
    echo -e "Your architecture is ${RED}not identified${NC}" && exit 1
fi

version=$(curl -s https://status.serverbee.app/api/version)
echo -e "Latest version is ${GREEN}$version${NC}"


url="$BASE_URL/$version/serverbee-deploy-$ARCH-$tuple.zip"
echo -e "Downloading ${GREEN}$url${NC}"

mkdir "serverbee"
cd "serverbee" || exit
curl -s -L "$url" -o serverbee-deploy.zip
unzip -o serverbee-deploy.zip
rm serverbee-deploy.zip
./serverbee-deploy
