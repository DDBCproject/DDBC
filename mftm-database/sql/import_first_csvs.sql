USE `messages_from_the_mines`;

-- these will likely spit out warnings like:
--     Warning	1261	Row 1 doesn't contain data for all columns
-- this is because the id, nsfw columns were added to the schema after the
-- csvs were created by the python script. They columns are added at the 
-- end of the schema, so it shouldn't be a problem.

-- this is a print statement in SQL, lol
SELECT '[+] importing coinbase_messages' AS '';
LOAD DATA LOCAL INFILE './csv/coinbase_messages.csv'  
INTO TABLE `coinbase_messages` 
FIELDS TERMINATED BY ',' 
OPTIONALLY ENCLOSED BY '\"' IGNORE 1 LINES; SHOW WARNINGS;

SELECT '[+] importing address_messages' AS '';
LOAD DATA LOCAL INFILE './csv/address_messages.csv'  
INTO TABLE `address_messages` 
FIELDS TERMINATED BY ',' 
OPTIONALLY ENCLOSED BY '\"' IGNORE 1 LINES; SHOW WARNINGS;

SELECT '[+] importing file_address_messages' AS '';
LOAD DATA LOCAL INFILE './csv/file_address_messages.csv'  
INTO TABLE `file_address_messages` 
FIELDS TERMINATED BY ',' 
OPTIONALLY ENCLOSED BY '\"' IGNORE 1 LINES; SHOW WARNINGS;

SELECT '[+] importing op_return_address_messages' AS '';
LOAD DATA LOCAL INFILE './csv/op_return_address_messages.csv'  
INTO TABLE `op_return_address_messages` 
FIELDS TERMINATED BY ',' 
OPTIONALLY ENCLOSED BY '\"' IGNORE 1 LINES; SHOW WARNINGS;

SELECT '[+] importing op_return_file_address_messages' AS '';
LOAD DATA LOCAL INFILE './csv/op_return_file_address_messages.csv'  
INTO TABLE `op_return_file_address_messages` 
FIELDS TERMINATED BY ',' 
OPTIONALLY ENCLOSED BY '\"' IGNORE 1 LINES; SHOW WARNINGS;

-- copy data from original tables into the three unique tables
SELECT '[+] copying original table data to unique tables' AS '';
INSERT IGNORE `coinbase_messages_unique`           SELECT * FROM `coinbase_messages`;
INSERT IGNORE `address_messages_unique`            SELECT * FROM `address_messages`;
INSERT IGNORE `op_return_address_messages_unique`  SELECT * FROM `op_return_address_messages`;
