@echo off

rem Simple Local HTTP Bootstrap via PHP
rem because, we can't deal with bullshit.

set PROT=http
set HOST=127.0.0.1
set PORT=5000
set PATH=/index.htm
set LISTEN=0.0.0.0

start %PROT%://%HOST%:%PORT%%PATH%
php -S %LISTEN%:%PORT% -t "%CD%"
exit /b %ERRORLEVEL%
