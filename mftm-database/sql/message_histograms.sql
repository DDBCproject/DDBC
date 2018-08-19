-- create histograms of the most frequent messages embedded in the blockchain
SELECT CONVERT(UNHEX(`data`) USING utf8), COUNT(*) FROM `coinbase_messages` GROUP BY `data` ORDER BY COUNT(*) DESC;
SELECT CONVERT(UNHEX(`data`) USING utf8), COUNT(*) FROM `address_messages` GROUP BY `data` ORDER BY COUNT(*) DESC;
SELECT CONVERT(UNHEX(`data`) USING utf8), COUNT(*) FROM `op_return_address_messages` GROUP BY `data` ORDER BY COUNT(*) DESC;
