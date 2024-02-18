@echo off

setlocal

set _OPT=%1

rem Simple Local HTTP Bootstrap via PHP
rem because, we can't deal with bullshit.

set _PROT=http
set _HOST=127.0.0.1
set _PORT=5000
set _PATH=/index.htm
set _LISTEN=0.0.0.0

rem Only invoke the default web browser
rem if the 2nd parameter was not "--"
if ["%_OPT%"] neq ["--"] (
    start %_PROT%://%_HOST%:%_PORT%%_PATH%
)

php -S %_LISTEN%:%_PORT% -t "%CD%"
exit /b %ERRORLEVEL%
