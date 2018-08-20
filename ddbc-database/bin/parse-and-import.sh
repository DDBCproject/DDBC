#!/bin/bash

# resume parsing the blockchain, saving new block messages to separate files
# if this is successful, import the csv files with the highest leading # from ../data/csv

# it's gross to call python3 for parse-blockchain.py and python2 for the import
# but the MySQL python package doesn't support python3 (somehow!) 
echo "[parse-and-import.sh] parsing blockchain..."
python3 parse-blockchain.py \
	--output-dir ../data/csv \
	--block-dir /media/sf_Vboxshare/DDBC/blocks \
	--resume \
	--separate-files \
&& \
echo "[parse-and-import.sh] importing csvs..." && \
python2 mysql-import-newest-csvs.py && \
echo "[parse-and-import.sh] auto-reviewing message patterns..." && \
mysql -u root -p messages_from_the_mines < ../sql/automated-review.sql && \
echo "[parse-and-import.sh] done."

