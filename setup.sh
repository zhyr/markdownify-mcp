#!/bin/bash

<<<<<<< HEAD
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
=======
echo 'prepare Unix preinstall'
echo 'Installing Python dependencies for OCR...'
echo 'Installing uv'
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env
echo 'Using uv to install markitdown'
uv sync
echo 'Finished install Python dependencies'
>>>>>>> 224cf89f0d58616d2a5522f60f184e8391d1c9e3
