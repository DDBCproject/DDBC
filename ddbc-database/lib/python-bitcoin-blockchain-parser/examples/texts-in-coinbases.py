# Copyright (C) 2015-2016 The bitcoin-blockchain-parser developers
#
# This file is part of bitcoin-blockchain-parser.
#
# It is subject to the license terms in the LICENSE file found in the top-level
# directory of this distribution.
#
# No part of bitcoin-blockchain-parser, including this file, may be copied,
# modified, propagated, or distributed except according to the terms contained
# in the LICENSE file.

import sys
sys.path.append('..')
from blockchain_parser.blockchain import Blockchain
from blockchain_parser.script import CScriptInvalidError

def is_ascii_text(op):
    return all(32 <= x <= 127 for x in op)

def as_utf8_text(x):
    try:
        return x.decode('UTF-8')
    except UnicodeDecodeError:
        return None

blockchain = Blockchain(sys.argv[1])
for block in blockchain.get_ordered_blocks(sys.argv[1] + '/index'):
    for transaction in block.transactions:

        coinbase = transaction.inputs[0]

        try:
            script_operations = [op for op in coinbase.script.operations if type(op) == bytes]
        except CScriptInvalidError:
            break

        # An operation is a CScriptOP or pushed bytes
        for operation in script_operations:
            text = as_utf8_text(operation)
            if text and len(operation.strip(b'\x00')) >= 20:
                # print(block.header.timestamp, text)
                if not is_ascii_text(operation):
                    print('{}'.format(operation.decode('UTF-8')))
                pass
        break
