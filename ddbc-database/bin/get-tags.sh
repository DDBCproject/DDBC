#!/bin/bash
QUERY=\
"SELECT tags FROM coinbase_messages WHERE tags != '';
SELECT tags FROM address_messages WHERE tags != '';
SELECT tags FROM op_return_address_messages WHERE tags != '';"

RESULTS=$(mysql -u root -p messages_from_the_mines -s --raw -e "$QUERY")
echo "$RESULTS" | tr -d '\n' | sed s/,,/,/g | tr ',' '\n' | sort -u