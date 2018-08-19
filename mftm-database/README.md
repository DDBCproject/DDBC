# mftm-database

Messages from the Mines database code.

## Install Dependencies

```bash
# install Bitcoin Core
sudo apt-add-repository ppa:bitcoin/bitcoin
sudo apt-get update
sudo apt-get install bitcoin-qt bitcoind

# sync the blockchain for the first time, this can take hours...
bitcoin-qt

# install lib/python-bitcoin-blockchain-parser submodule
git submodule init
git submodule update
cd lib/python-bitcoin-blockchain-parser submodule

# install leveldb
sudo apt update
sudo apt install mysql-server mysql-workbench libleveldb-dev

# install python3 dependencies
pip3 install requirements.txt

# back to project root 
cd ../..

# bin/mysql-import-newest-csvs.py uses the mysql-connector python package
# unfortunately it doesn't support python3 yet, so we have to use python2
pip2 install mysql-connector
```

## Project Structure

The code in this repo handles 1) parsing the Bitcoin blockchain to extract messages and 2) creating and populating a MySQL database with these messages. Once this database exists, it's up to `mitm-backend` to expose it via an API.

- `bin/`: scripts and executables. Most notably: `parse-blockchain.py`, `parse-and-import.sh`, and `mysql-import-newest-csvs.py`. 
- `data/`: `parse-blockchain.py` saves files to `data/csv` by default. 
- `sql`/: sql database schema and other sql files. `messages_from_the_mines.sql` contains the database schema. `import_csv.sql` is used to import the first set of csv files into that database.
- `lib/`: contains python library dependencies. `lib/python-bitcoin-blockchain-parser` for now.
- `src/`: source files.

I strongly suggest reading this entire README before proceeding with code/commands as you may find that some steps are unecessary once you understand the entire workflow.

## Parsing the Blockchain

Messages from the blockchain can be parsed using `bin/parse-blockchain.py`. This process takes ~2 days to parse the entire blockchain on a 4.2GHz Intel CPU. Luckily, you can easily resume parsing where you've left off using the `--resume` flag (and pointing to the correct `--output-dir` folder). We've parsed the data up through 03/03/2018 and made a zip of those csv files available for download [here](https://git.brangerbriz.com:4443/bdorsey/mftm-database/uploads/1454a9de2845a7aadbf4153ed3d62314/csv_03-03-2018.tar.gz). Unzip them in `data` so that the csv files live in `data/csv/`.

Once you've done that, you can resume parsing with:

```bash
# navigate to bin
cd bin

# parse using python3
python3 parse-blockchain.py \
	--output-dir ../data/csv \
	--block-dir ~/.bitcoin/blocks \
	--resume \
	--separate-files
```

Each time you run this, blockchain parsing will resume one block after the block specified in `../data/csv/last_block.txt`. Files will be saved as `0001_*.csv`, `0002_*.csv`, etc.

## Editing MySQL Credentials

You must add your MySQL user/database credentials to [`config.json`](config.json) before importing to the database. Here is an example of how this file should look:

```json
{
	"mysql": {
		"user": "root", 
		"password": "change-me-or-get-pwned",
        "host": "127.0.0.1",
        "database": "messages_from_the_mines"
	}
}
```

**Note**: There are certain security vulnerabilities that may come with using the root MySQL user. It is recommended that you create a new MySQL user with appropriate read/write priviledges to the `messages_from_the_mines` schema and use that user instead. 

## Creating the MySQL Database

Make sure your mysql server is running and you have a user. Next, create the `messages_from_the_mines` schema:

```bash
cd sql/

# create the database schema
mysql -u root -p < messages_from_the_mines.sql

# import the initial data. ONLY use this once to import the original (non XXXX_*.csv) 
# files in data/csv. DO NOT use this script to import new data each time blockchain 
# parsing is resume
mysql -u root -p < import_first_csvs.sql

# you may see "too few columns" warnings. You can ignore them as `id` is not present
# in the csvs because it is auto-incremented in the MySQL tables
```

## Resuming Parsing and Auto Importing to the Database

Once the first two initial steps have been completed the normal workflow for 1) resuming blockchain parsing and 2) importing the generated csvs to the MySQL database can be achieved with the [`bin/parse-and-import.sh`](bin/parse-and-import.sh) script. 

**BE CAREFUL** with this step. I stress this because you do **NOT** want to re-import already imported data into your database. This won't be a problem for the `*_unique` tables, but it **WILL** create redundancy in the other tables. Files imported by `mysql-import-newest-csvs.py` (and therefore `parse-and-import.sh` as well) will have their names saved to `data/csv/imported.txt` in an attempt to protect this from happening, but this step should still be considered fragile.