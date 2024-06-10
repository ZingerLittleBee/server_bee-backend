#!/bin/bash

BASE_URL="https://db.serverbee.app/cli"

ERROR='\033[0;31m'
INFO='\033[0;32m'
WARNING='\033[0;33m'
# No Color
NC='\033[0m'

OS="$(uname)"
ARCH="$(uname -m)"
tuple=""

if [[ "$OS" == "Linux" ]]; then
    echo -e "OS: ${INFO}Linux${NC}"
    tuple="unknown-linux-musl"
elif [[ "$OS" == "Darwin" ]]; then
    echo -e "OS: ${INFO}macOS${NC}"
    tuple="apple-darwin"
else
    echo -e "OS ${ERROR}not identified${NC}" && exit 1
fi

if [[ "$ARCH" == "x86_64" ]]; then
    echo -e "Architecture: ${INFO}AMD${NC}"
    ARCH="x86_64"
elif [[ "$ARCH" == "arm64" || "$ARCH" == *"armv"* ]]; then
    echo -e "Architecture: ${INFO}ARM${NC}"
    ARCH="aarch64"
else
    echo -e "Architecture ${ERROR}not identified${NC}" && exit 1
fi

start_on_boot() {
  if [[ $is_start_on_boot == "y" ]]; then
      echo -e "Starting on boot..."
cat > /etc/systemd/system/serverbee-web.service <<EOF
[Unit]
Description=ServerBee Web
After=network-online.target systemd-resolved.service
Wants=network-online.target systemd-resolved.service

[Service]
Type=simple
ExecStart=$PWD/serverbee-web
RemainAfterExit=yes
Restart=always
RestartSec=5s
Environment="RUST_LOG=info"

[Install]
WantedBy=multi-user.target
EOF

      systemctl enable serverbee-web.service
    else
        echo -e "${ERROR}Failed to enable auto start on boot, please enable it manually.${NC}"
    fi
}

installation() {
  echo -e "=======================  Installation  =========================="

  echo -e "${INFO}Starting installation...${NC}"

  echo -e "Getting the latest version of ServerBee"
  version=$(curl -s https://status.serverbee.app/api/version)
  echo -e "Latest version: ${INFO}$version${NC}"

  echo -e "\nPress ${INFO}Enter to install ${NC}, or ${ERROR}Ctrl+C to cancel${NC}"
  read -r

  url="$BASE_URL/$version/serverbee-web-$ARCH-$tuple.zip"
  echo -e "Downloading ${INFO}$url${NC}"

  mkdir "serverbee"
  cd "serverbee" || exit
  curl -s -L "$url" -o serverbee-web.zip
  unzip -o serverbee-web.zip
  rm serverbee-web.zip

  echo -e "\nEnter the ${INFO}port${NC} what you want to use:"
  read -r port

  # check the command netstat exists
  if command -v netstat &> /dev/null; then
      echo -e "netstat exists, checking if port $port is available..."
      # check if port is available, if not, input another port
      while true; do
        if [[ $(netstat -an | grep -c "$port") -eq 0 ]]; then
          break
        else
          echo -e "${ERROR}Port $port is already in use, please try another port.${NC}"
          read -r port
            if [[ -z $port ]]; then
              echo -e "${ERROR}Port is empty, please try again.${NC}"
              read -r port
            fi
        fi
      done
  fi

  echo -e "Enable auto start on boot? (y/n)"
  read -r is_start_on_boot

  if [[ "$OS" == "Linux" ]]; then
      start_on_boot
  fi

  nohup ./serverbee-web -p $port >/dev/null 2>&1 &
  echo -e "Installation completed."
  echo -e "=======================  End  ==========================="
  echo -e "\n"
  echo -e "=======================  Tips  =========================="
  echo -e "1. Website UI: http://localhost:$port"
  echo -e "2. If server is not running, please check the ${INFO}web.log${NC} in serverbee directory."
  echo -e "3. If want to stop the server, please use ${INFO}ps -ef | grep serverbee-web | grep -v grep | awk '{print $2}' | xargs kill -9${NC} to stop the server."
  echo -e "========================================================="
}

stop() {
  echo -e "=======================  Stop  =========================="
  echo -e "Stopping the service..."
  ps -ef | grep serverbee-web | grep -v grep | awk '{print $2}' | xargs kill -9
  echo -e "Stopped successfully."
  echo -e "=======================  End  ==========================="
}

update() {
  echo -e "=======================  Update  =========================="
  echo -e "Updating the service..."
  cd serverbee || { echo -e "${ERROR}Directory serverbee not found. Please run installation.${NC}" && exit 1; }

  stop

  echo -e "Getting the latest version of ServerBee"
  version=$(curl -s https://status.serverbee.app/api/version)
  echo -e "Latest version: ${INFO}$version${NC}"

  echo -e "\nPress ${INFO}Enter to update ${NC}, or ${ERROR}Ctrl+C to cancel${NC}"
  read -r

  url="$BASE_URL/$version/serverbee-web-$ARCH-$tuple.zip"
  echo -e "Downloading ${INFO}$url${NC}"

  curl -s -L "$url" -o serverbee-web.zip
  unzip -o serverbee-web.zip
  rm serverbee-web.zip

  echo -e "Updated successfully."
  echo -e "=======================  End  =========================="
}

uninstallation() {
    echo -e "=======================  Uninstallation  =========================="

    echo -e "${INFO}Starting uninstallation...${NC}"
    stop

    echo -e "Do you want to execute the following steps?"
    echo -e "1. Remove ${INFO}the directory of serverbee (including data)${NC}"
    echo -e "${WARNING}rm -rf serverbee${NC}"
    echo -e "2. Remove ${INFO}the service of serverbee${NC} (if exist)"
    echo -e "${WARNING}rm -f /etc/systemd/system/serverbee-web.service${NC}"

    echo -e "\nPress ${INFO}Enter to execute ${NC}, or ${ERROR}Ctrl+C to cancel${NC}"
    read -r

    if [[ -d serverbee ]]; then
        rm -rf serverbee
        rm -f /etc/systemd/system/serverbee-web.service

    else
        echo -e "${ERROR}Directory serverbee not found.${NC}" && exit 1
    fi

    echo -e "${INFO}Uninstallation completed.${NC}"
    echo -e "=======================  End  =========================="
}

log() {
    echo -e "=======================  Log  =========================="
    echo -e "Log file: ${INFO}web.log${NC}"

    if [ -e "web.log" ]; then
        tail -n 200 web.log
    else
        [ -d "serverbee" ] || { echo -e "${ERROR}Directory serverbee not found.${NC}" && exit 1; }
        tail -n 200 serverbee/web.log
    fi

    echo -e "=======================  End  =========================="
}

echo "=======================  Commands  =========================="
echo "Welcome to use ServerBee automatic installation, please select an option:"
options=("Installation" "Update" "Uninstallation" "Log" "Stop" "Exit")
select opt in "${options[@]}"; do
    case $opt in
    "Installation")
        installation
        ;;
    "Update")
        update
        ;;
    "Uninstallation")
        uninstallation
        ;;
    "Log")
        log
        ;;
    "Stop")
        stop
        ;;
    "Exit")
        break
        ;;
    *) echo "Invalid selection, please try again" ;;
    esac
done
