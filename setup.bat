@echo off

set /A envCreated=0
set /A dbFolderCreated=0
set /A dbCreated=0

if not exist .env (
    echo DATABASE_PATH=%~dp0database\db.sqlite > .env
    set envCreated=1
)

if not exist database (
    mkdir database
    set dbFolderCreated=1
)

cd database

if not exist db.sqlite (
    echo. > db.sqlite
    copy /y NUL db.sqlite > NUL
    set dbCreated=1
)

set /A true=0
if %envCreated%==1 set true=1
if %dbFolderCreated%==1 set true=1
if %dbCreated%==1 set true=1

if %true%==1 (
    echo | set /p OPTION="Successfully created ["
    if %envCreated%==1 echo | set /p OPTION=".env file, "
    if %dbFolderCreated%==1 echo | set /p OPTION="database folder, "
    if %dbCreated%==1 echo | set /p OPTION="db.sqlite"
    echo ].
)
if %true%==0 (
    echo Nothing to create.
)
PAUSE