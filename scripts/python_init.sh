#!/usr/bin/env bash

chmod +x scripts/solve_geetest_captcha.sh
python3 -m venv env
source env/bin/activate
pip install opencv-python
