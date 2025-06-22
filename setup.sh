#!/bin/bash

echo 'Installing Python dependencies...'

# 检查 uv 是否已安装
if ! command -v uv &> /dev/null; then
    echo 'uv not found, installing...'
    curl -LsSf https://astral.sh/uv/install.sh | sh
else
    echo 'uv already installed'
fi

echo 'Installing markitdown and dependencies...'
uv pip install markitdown
uv pip install -e .

echo 'Setup completed!'
echo 'prepare Unix preinstall'
echo 'Installing Python dependencies for OCR...'
echo 'Installing uv'
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env
echo 'Using uv to install markitdown'
uv sync
echo 'Finished install Python dependencies'
