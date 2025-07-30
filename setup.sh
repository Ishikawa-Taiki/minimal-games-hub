#!/bin/bash

# Check if nodenv is installed
if ! command -v nodenv &> /dev/null
then
    echo "nodenv could not be found. Please install it."
    exit 1
fi

# Install the correct node version
nodenv install

# Install dependencies
npm install