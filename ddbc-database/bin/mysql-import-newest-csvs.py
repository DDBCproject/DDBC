import sys
import os
import re
import json
import mysql.connector

def main():

    with open('../config.json') as f:
        config = json.load(f)

    folder = '../data/csv/'
    files = [file for file in os.listdir(folder) if re.match('^\d{4}_.+\.csv$', file)]
    if len(files) > 0:
        files = sorted(files, reverse=True)[0:5]

    # make sure we haven't already imported these file names
    already_imported = []
    already_imported_path = '../data/csv/imported.txt'
    if os.path.exists(already_imported_path):
        with open(already_imported_path, 'r') as f:
            already_imported = [line.strip() for line in f]
    for file in files:
        if file in already_imported:
            print('Error file already imported: {}'.format(file))
            sys.exit(1)

    cnx = mysql.connector.connect(user=config['mysql']['user'], 
                                  password=config['mysql']['password'],
                                  host=config['mysql']['host'],
                                  database=config['mysql']['database'])
    cursor = cnx.cursor()

    query_template = """LOAD DATA LOCAL INFILE '{file}'  
                      INTO TABLE `{table}` 
                      FIELDS TERMINATED BY ',' 
                      OPTIONALLY ENCLOSED BY '\"' IGNORE 1 LINES;"""

    queries = []

    for file in files:
        # extract the table name from the filename
        table = re.sub('^\d{4}_', '', file).replace('.csv', '')
        file = os.path.join(folder, file)

        queries.append(query_template.format(file=file, table=table))
        if table in ['coinbase_messages', 'address_messages', 'op_return_address_messages']:
            queries.append(query_template.format(file=file, table='{}_unique'.format(table)))

    for query in queries:
        try:
            print(query)
            cursor.execute(query)
            cnx.commit()
        except mysql.connector.Error as err:
            print("MySQL error: {}".format(err))
            continue

    cursor.close()
    cnx.close()

    with open('../data/csv/imported.txt', 'a') as f:
        f.write('\n'.join(files))
        f.write('\n')
        print('wrote filenames to ../data/csv/imported.txt')

if __name__ == '__main__':
    main()