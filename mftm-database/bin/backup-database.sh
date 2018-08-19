# !/bin/bash

DATE=`date +%Y-%m-%d`
FILENAME="../sql/backups/${DATE}.sql"
echo "Backing up database to ${FILENAME}"

mysqldump -u root -p --databases messages_from_the_mines > "$FILENAME"

echo "Compressing ${FILENAME} to ${FILENAME}.gz"
gzip -9 "$FILENAME"