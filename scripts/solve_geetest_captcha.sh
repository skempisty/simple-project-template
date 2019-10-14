#!/usr/bin/env bash

cd src/python
python3 get_geetest_captcha_solution.py
cd ../..
rm captcha_key.png
rm captcha_lock.png
