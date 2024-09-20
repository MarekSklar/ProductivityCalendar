@echo off

set /A true=0

if not exist database (
    mkdir database
    set true=1
)

if not exist .output (
    mkdir .output
    set true=1
)

cd .output

if not exist server (
    mkdir server
    set true=1
)

cd server

if not exist database (
    mkdir database
    set true=1
)

cd database

if not exist db.sqlite (
    echo. > db.sqlite
    copy /y NUL db.sqlite > NUL
    set true=1
)

if %true%==1 (
    echo Successfully created files.
)
if %true%==0 (
    echo Nothing to create.
)
PAUSE