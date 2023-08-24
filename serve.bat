@echo off
start http://127.0.0.1:5000/index.htm
php -S 0.0.0.0:5000 -t "%cd%"
exit /b 0
