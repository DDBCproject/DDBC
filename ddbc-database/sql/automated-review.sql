-- Tons of messages we've extracted are protocols that match easily identifiable
-- patterns. We use this file to review (remove) these types of messages "by hand".

-- COINBASES -------------------------------------------------------------------

-- %/slush/% in coinbase_messages
UPDATE `coinbase_messages_unique` SET `reviewed` = 1 WHERE `data` LIKE CONCAT('%', HEX('/slush/'), '%');
UPDATE `coinbase_messages`        SET `reviewed` = 1 WHERE `data` LIKE CONCAT('%', HEX('/slush/'), '%');

-- Mined by% in coinbase_messages
UPDATE `coinbase_messages_unique` SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('Mined by'), '%');
UPDATE `coinbase_messages`        SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('Mined by'), '%');
UPDATE `coinbase_messages_unique` SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('/ViaBTC/Mined by'), '%');
UPDATE `coinbase_messages`        SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('/ViaBTC/Mined by'), '%');

-- OP_RETURN ADDRESS MESSAGES --------------------------------------------------

-- OA% in op_return_address_messages
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('OA'), '%');
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('OA'), '%');

-- omni% in op_return_address_messages
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('omni'), '%');
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('omni'), '%');

-- id;% in op_return_address_messages
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('id;'), '%');
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('id;'), '%');
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('id:'), '%');
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('id:'), '%');

-- OP_RETURN CONF TEST 
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('OP_RETURN CONF TEST '), '%');
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('OP_RETURN CONF TEST '), '%');

-- ** PROOF.COM **%
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('** PROOF.COM **'), '%');
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('** PROOF.COM **'), '%');

-- 'ASCRIBESPOOL%'
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('ASCRIBESPOOL'), '%');
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('ASCRIBESPOOL'), '%');

-- '@COPYROBO@%'
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('@COPYROBO@'), '%');
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('@COPYROBO@'), '%');

-- 'EUK %'
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('EUK '), '%');
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('EUK '), '%');

-- 'POR:%'
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('POR:'), '%');
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('POR:'), '%');

-- 'POTX:%'
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('POTX:'), '%');
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('POTX:'), '%');

-- 'Unknown:%'
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('Unknown:'), '%');
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('Unknown:'), '%');

-- 'Veri:%'
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('Veri:'), '%');
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('Veri:'), '%');

-- "AuroM %"
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('AuroM '), '%');
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('AuroM '), '%');

-- "Aurum Payout %"
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('Aurum Payout '), '%');
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('Aurum Payout '), '%');

-- "BERNSTEIN 1.0 %"
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('BERNSTEIN 1.0 '), '%');
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('BERNSTEIN 1.0 '), '%');

-- "Dz22%"
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('Dz22'), '%');
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('Dz22'), '%');

-- 'Spillover Payout %'
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('Spillover Payout '), '%'); 
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE `data` LIKE CONCAT(HEX('Spillover Payout '), '%'); 

-- Messages like:
-- 		AV2vjYs+e8+BBBkz3KjPVg==
-- 		B259dl3utIzZ8okk7yhOpw==
-- 		C25q4aEQdmFeH5odxStIbg==
-- Regex translates to "a string containing only 22 characters followed by two =="
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE CONVERT(UNHEX(`data`) USING utf8mb4) REGEXP '^.{22}==$';
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE CONVERT(UNHEX(`data`) USING utf8mb4) REGEXP '^.{22}==$';

-- e.g. "smnH+y4UF0HWsyWlNEiwfUXWdEhzrdDffWxnUU1cO7Y="
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE CONVERT(UNHEX(`data`) USING utf8mb4) REGEXP '^.{43}=$';
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE CONVERT(UNHEX(`data`) USING utf8mb4) REGEXP '^.{43}=$';

-- Messages containing only hex values longer than 8 characters
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE CONVERT(UNHEX(`data`) USING utf8mb4) REGEXP '^[0-9a-fA-F]{8,}$';
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE CONVERT(UNHEX(`data`) USING utf8mb4) REGEXP '^[0-9a-fA-F]{8,}$';

-- e.g. "QmUmmEH1dvSwinWL7iXG74kBcQygLcm66fuJsM6CQwaybs"
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE CONVERT(UNHEX(`data`) USING utf8mb4) REGEXP '^Qm.{44}$';
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE CONVERT(UNHEX(`data`) USING utf8mb4) REGEXP '^Qm.{44}$';

-- several protocols use the following headers:
-- 		"KC", "CL ", "CS ", "OL ", "OS "
-- These seem to general to exclude, but I've comed through over 100K results
-- and these headers are not very ambigious. These regexes flag 1-2 real messages
-- only with the benifit of autolabelling 8K+.
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE CONVERT(UNHEX(`data`) USING utf8mb4) REGEXP '^(CC|KC|CL |CS |OL |OS ).+';
UPDATE `op_return_address_messages`       SET `reviewed` = 1 WHERE CONVERT(UNHEX(`data`) USING utf8mb4) REGEXP '^(CC|KC|CL |CS |OL |OS ).+';

-- regex to match Bitcoin addresses
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE CONVERT(UNHEX(`data`) USING utf8mb4) REGEXP '^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$';
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE CONVERT(UNHEX(`data`) USING utf8mb4) REGEXP '^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$';

-- regex to match hashes of length 39 and greater
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE CONVERT(UNHEX(`data`) USING utf8mb4) REGEXP '^[0-9a-zA-Z]{39,}$';
UPDATE `op_return_address_messages`         SET `reviewed` = 1 WHERE CONVERT(UNHEX(`data`) USING utf8mb4) REGEXP '^[0-9a-zA-Z]{39,}$';

-- e.g. "0=ce8050a0c5338256e8341ab63f1af01a4356ba7141ec0a6728dee2e325a53657"
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE CONVERT(UNHEX(`data`) USING utf8mb4) REGEXP '^0=.{64}$';
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE CONVERT(UNHEX(`data`) USING utf8mb4) REGEXP '^0=.{64}$';

-- e.g. "XLXd4bfa09438e9061b9e94ea569eecdcd3  -"
UPDATE `op_return_address_messages_unique` SET `reviewed` = 1 WHERE CONVERT(UNHEX(`data`) USING utf8mb4) REGEXP '^XL.+  -$';
UPDATE `op_return_address_messages`        SET `reviewed` = 1 WHERE CONVERT(UNHEX(`data`) USING utf8mb4) REGEXP '^XL.+  -$';
