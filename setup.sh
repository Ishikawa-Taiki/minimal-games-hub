#!/bin/bash

# Check if nvm is installed
if [ -z "$NVM_DIR" ]; then
  echo "nvm is not installed. Please install it from https://github.com/nvm-sh/nvm"
  exit 1
fi

# Install and use the correct node version
nvm install
nvm use

# Install dependencies
npm install
