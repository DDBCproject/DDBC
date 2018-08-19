#!/usr/bin/env python3

import sys
sys.path.append('../lib/python-bitcoin-blockchain-parser')
sys.path.append('../src')

import re
import os
import csv
import hashlib
import binascii
import argparse
import signal
import signatures
from collections import OrderedDict
from base58 import b58decode
from blockchain_parser.blockchain import Blockchain
from blockchain_parser.script import CScriptInvalidError, CScriptInvalidError, CScriptTruncatedPushDataError

def parse_args():
    parser = argparse.ArgumentParser(
                        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument('--block-dir', type=str, default='~/.bitcoin/blocks', dest='block_dir',
                        help='path to bitcoin block data.')
    parser.add_argument('--output-dir', type=str, dest='output_dir',
                        default='../data/csv_copy',
                        help='directory to save output csv files to.')
    parser.add_argument('--resume', default=False, action='store_true',
                        help='resume parsing from files in --output-dir')
    parser.add_argument('--separate-files', default=True, action='store_true', dest='separate_files',
                        help='resume parsing from files in --output-dir')
    return parser.parse_args()

def open_csv_writers(folder, resume, separate_files):

    open_as = 'a' if resume and not separate_files else 'w'

    file_prefix = ''
    # if we are resuming with separate files, find the appropriate next
    # number to use for the file prefix (e.g. 0001_ -> 0002_)
    if resume and separate_files:
        files = [file for file in os.listdir(folder) if re.match('^\d{4}_.+\.csv$', file)]
        if len(files) == 0:
            file_prefix = '0001_'
            print(file_prefix)
        else:
            num = int(sorted(files, reverse=True)[0][0:4]) + 1
            file_prefix = '{:04d}_'.format(num)

    coinbase_messages_file = open(os.path.join(folder, '{}coinbase_messages.csv'.format(file_prefix)), open_as, encoding='utf-8')
    address_messages_file = open(os.path.join(folder, '{}address_messages.csv'.format(file_prefix)), open_as, encoding='utf-8')
    file_address_messages_file = open(os.path.join(folder, '{}file_address_messages.csv'.format(file_prefix)), open_as, encoding='utf-8')
    op_return_address_messages_file = open(os.path.join(folder, '{}op_return_address_messages.csv'.format(file_prefix)), open_as, encoding='utf-8')
    op_return_file_address_messages_file = open(os.path.join(folder, '{}op_return_file_address_messages.csv'.format(file_prefix)), open_as, encoding='utf-8')

    print('[+] writing to files:')
    print('        {}coinbase_messages.csv'.format(file_prefix))
    print('        {}address_messages.csv'.format(file_prefix))
    print('        {}file_address_messages.csv'.format(file_prefix))
    print('        {}op_return_address_messages.csv'.format(file_prefix))
    print('        {}op_return_file_address_messages.csv'.format(file_prefix))

    kwargs = {
        'dialect': csv.excel,
        'escapechar': '\\',
        'doublequote': False
    }

    fieldnames = ['block_height', 'block_hash', 'block_timestamp', 
    'transaction_hash', 'script_op_index', 'data', 'valid', 'tags', 'bookmarked',
     'reviewed', 'annotation', 'nsfw', 'data_hash']
    coinbase_messages_writer = csv.DictWriter(coinbase_messages_file, fieldnames=fieldnames, **kwargs)

    fieldnames = ['block_height', 'block_hash', 'block_timestamp', 
    'transaction_index', 'transaction_hash', 'data', 'valid', 'tags',
    'bookmarked', 'reviewed', 'annotation', 'format', 'nsfw', 'data_hash']
    address_messages_writer = csv.DictWriter(address_messages_file, fieldnames=fieldnames, **kwargs)

    fieldnames = ['block_height', 'block_hash', 'block_timestamp', 
    'transaction_index', 'transaction_hash', 'data', 'filetype', 'valid', 'tags',
     'bookmarked', 'reviewed', 'annotation', 'nsfw', 'data_hash']
    file_address_messages_writer = csv.DictWriter(file_address_messages_file, fieldnames=fieldnames, **kwargs)

    fieldnames = ['block_height', 'block_hash', 'block_timestamp', 
    'transaction_index', 'transaction_hash', 'data', 'valid', 'tags', 
    'bookmarked', 'reviewed', 'annotation', 'format', 'nsfw', 'data_hash']
    op_return_address_messages_writer = csv.DictWriter(op_return_address_messages_file, fieldnames=fieldnames, **kwargs)

    fieldnames = ['block_height', 'block_hash', 'block_timestamp',
    'transaction_index', 'transaction_hash', 'data', 'filetype', 'valid', 'tags',
     'bookmarked', 'reviewed', 'annotation', 'nsfw', 'data_hash']
    op_return_file_address_messages_writer = csv.DictWriter(op_return_file_address_messages_file, fieldnames=fieldnames, **kwargs)

    # write file headers if we aren't resuming or we are writing to separate files
    if not resume or separate_files:
        coinbase_messages_writer.writeheader()
        address_messages_writer.writeheader()
        file_address_messages_writer.writeheader()
        op_return_address_messages_writer.writeheader()
        op_return_file_address_messages_writer.writeheader()

    data = dict()
    data['files'] = dict()
    data['writers'] = dict()

    data['files']['coinbase_messages']         = coinbase_messages_file
    data['files']['address_messages']           = address_messages_file
    data['files']['file_address_messages']           = file_address_messages_file
    data['files']['op_return_address_messages'] = op_return_address_messages_file
    data['files']['op_return_file_address_messages'] = op_return_file_address_messages_file

    data['writers']['coinbase_messages']         = coinbase_messages_writer
    data['writers']['address_messages']           = address_messages_writer
    data['writers']['file_address_messages']           = file_address_messages_writer
    data['writers']['op_return_address_messages'] = op_return_address_messages_writer
    data['writers']['op_return_file_address_messages'] = op_return_file_address_messages_writer

    return data

def close_csv_files(files):
    [v.close() for k, v in files.items()]

def is_ascii_text(op):
    return all(32 <= x <= 127 for x in op)

def as_utf8_text(x):
    try:
        return x.decode('UTF-8')
    except UnicodeDecodeError:
        return None

def md5_hash(data):
    md5 = hashlib.new('md5')
    md5.update(bytes(data, encoding='utf8'))
    return md5.hexdigest()

# returns utf8 data if address data falls in range
# and None otherwise
def decode_address_uft8(base58address):
    decodedBin = b58decode(base58address)
    decodedBin = decodedBin[1:-4]
    try:
        # try and decode the data as text
        return decodedBin.decode()
    except UnicodeDecodeError as err:
        return None

# read the last block height from a .txt file if it exists
# otherwise return 0
def get_last_block_height(last_block_path):
    if os.path.exists(last_block_path):
        with open(last_block_path, 'r') as f:
            return int(f.read())
    else: return 0

def main():

    args = parse_args()
    data = open_csv_writers(args.output_dir, args.resume, args.separate_files)

    needs_exit = False

    def signal_handler(signal, frame):
        nonlocal needs_exit
        print('[!] ctrl-c caught, exit is queued, waiting for cleanup...')
        needs_exit = True

    signal.signal(signal.SIGINT, signal_handler)

    kwargs = {}

    start_block = 0
    if args.resume:
        start_block = get_last_block_height(os.path.join(args.output_dir, 'last_block.txt'))
        start_block += 1
        print('[*] resuming with block #{}'.format(start_block))

    blockchain = Blockchain(args.block_dir)
    last_block_height = -1
    print('[*] building the blockchain index')
    for block in blockchain.get_ordered_blocks(os.path.join(args.block_dir, 'index'), start=start_block):

        # print('[+] parsing block #{}: {}'.format(block.height, block.hash))
        # double check that ordered blocks are working
        # assert(block.height == last_block_height + 1)
        last_block_height = block.height

        for tx_index, transaction in enumerate(block.transactions):
            # if this is the first transaction in the block save its
            # coinbase if it is in the ascii range
            if tx_index == 0:

                coinbase = transaction.inputs[0]

                # Some coinbase scripts are not valid scripts
                try:
                    script_operations = [op for op in coinbase.script.operations
                                         if type(op) == bytes]

                    # An operation is a CScriptOP or pushed bytes
                    for op_index, operation in enumerate(script_operations):
                        if len(operation) > 4:      
                            coinbase_message = None
                            if is_ascii_text(operation):
                                coinbase_message = operation.decode('ascii')
                            elif as_utf8_text(operation) and len(operation.strip(b'\x00')) >= 20:
                                coinbase_message = as_utf8_text(operation)

                            if coinbase_message:
                                coinbase_message_data = binascii.hexlify(bytes(coinbase_message, encoding='utf8')).decode()
                                # write the coinbase message info to coinbase_messages.csv
                                data['writers']['coinbase_messages'].writerow({
                                    'block_height': block.height,
                                    'block_hash': block.hash,
                                    'block_timestamp': block.header.timestamp,
                                    'transaction_hash': transaction.hash,
                                    'script_op_index': op_index,
                                    'data': coinbase_message_data,
                                    'data_hash': md5_hash(coinbase_message_data),
                                    'valid': 0,
                                    'tags': '',
                                    'bookmarked': 0,
                                    'reviewed': 0,
                                    'annotation': '',
                                    'nsfw':0,
                                })

                                print('[+] coinbase found in tx {} script index {}:'.format(transaction.hash, op_index))
                                print(coinbase_message)

                except CScriptInvalidError:
                    pass

            address_text_buff = ''
            address_bytes_buff = bytearray()

            op_return_bytes_buff = bytearray()

            try:
                for output_index, output in enumerate(transaction.outputs):

                    # decode messages in the scripts
                    for opcode, byts, sop_idx in output.script.script.raw_iter():
                        # if this is the first script in this output
                        if sop_idx == 0:
                            # 106 is the official OP_RETURN opcode
                            # 81 is the OP_TRUE opcode, often used like OP_RETURN
                            if not (opcode == 106 or opcode == 81): break
                        # opcodes <= 78 correspond to arbitrary data or PUSHDATA
                        elif opcode <= 78:
                            op_return_bytes_buff += byts

                    for address_index, address in enumerate(output.addresses):

                        # address.address contains the base58 encoded address
                        # this encoded value will always be in the ASCII range

                        # we decode the base58 address
                        # remove the 1st byte (which contains a 1 or a 3 to denote the sigtype)
                        # remove the last 4 bytes because they are a checksum
                        # and are left with 160 bits of binary data
                        decodedBin = b58decode(address.address)
                        decodedBin = decodedBin[1:-4]
                        address_bytes_buff += decodedBin

                        try:
                            # try and decode the data as text
                            address_text_buff += decodedBin.decode()
                        except UnicodeDecodeError as err:
                            pass

                        # if this is the last address in the last output
                        if output_index == len(transaction.outputs) - 1 and \
                        address_index == len(output.addresses) - 1:

                            filetype = signatures.get_filetype(address_bytes_buff.hex())
                            if filetype:
                                # transaction_hash ; data ; filetype ; valid ; tags ; bookmarked ; reviewed ; annotation
                                # write the coinbase message info to coinbase_messages.csv
                                file_address_message = address_bytes_buff.hex()
                                data['writers']['file_address_messages'].writerow({
                                    'block_height': block.height,
                                    'block_hash': block.hash,
                                    'block_timestamp': block.header.timestamp,
                                    'transaction_index': tx_index,
                                    'transaction_hash': transaction.hash,
                                    # save binary data as a hex string
                                    'data': file_address_message,
                                    'data_hash': md5_hash(file_address_message),
                                    'filetype': filetype,
                                    'valid': 0,
                                    'tags': '',
                                    'bookmarked': 0,
                                    'reviewed': 0,
                                    'annotation': '',
                                    'nsfw': 0
                                })

                                print('[+] possible address {} file found in tx {}'.format(filetype, transaction.hash))

                            # if text was found in any of the output address blocks
                            if address_text_buff != '':
                                # transaction_hash ; data ; filetype ; valid ; tags ; bookmarked ; reviewed ; annotation
                                # write the coinbase message info to coinbase_messages.csv
                                address_message = binascii.hexlify(bytes(address_text_buff, encoding='utf8')).decode()
                                data['writers']['address_messages'].writerow({
                                    'block_height': block.height,
                                    'block_hash': block.hash,
                                    'block_timestamp': block.header.timestamp,
                                    'transaction_index': tx_index,
                                    'transaction_hash': transaction.hash,
                                    # save utf8 data as a hex string
                                    'data': address_message,
                                    'data_hash': md5_hash(address_message),
                                    'valid': 0,
                                    'tags': '',
                                    'bookmarked': 0,
                                    'reviewed': 0,
                                    'annotation': '',
                                    'format': 0,
                                    'nsfw': 0
                                })

                                print('[+] utf8 data found in tx {}:'.format(transaction.hash))
                                print('{}'.format(address_text_buff))
                                address_text_buff = ''

                if len(op_return_bytes_buff) > 0:

                    filetype = signatures.get_filetype(op_return_bytes_buff.hex())
                    if filetype:
                        op_return_file_address_message = op_return_bytes_buff.hex()
                        data['writers']['op_return_file_address_messages'].writerow({
                            'block_height': block.height,
                            'block_hash': block.hash,
                            'block_timestamp': block.header.timestamp,
                            'transaction_index': tx_index,
                            'transaction_hash': transaction.hash,
                            # save binary data as a hex string
                            'data': op_return_file_address_message,
                            'data_hash': md5_hash(op_return_file_address_message),
                            'filetype': filetype,
                            'valid': 0,
                            'tags': '',
                            'bookmarked': 0,
                            'reviewed': 0,
                            'annotation': '',
                            'nsfw': 0
                        })

                        print('[+] possible op_return address {} file found in tx {}'.format(filetype, transaction.hash))
                    
                    else:
                       
                        text = None
                        try:
                            # try and decode the data as text
                            text = op_return_bytes_buff.decode()
                        except UnicodeDecodeError as err:
                            pass

                        if text:
                            op_return_address_message = binascii.hexlify(bytes(text, encoding='utf8')).decode()
                            data['writers']['op_return_address_messages'].writerow({
                                'block_height': block.height,
                                'block_hash': block.hash,
                                'block_timestamp': block.header.timestamp,
                                'transaction_index': tx_index,
                                'transaction_hash': transaction.hash,
                                # save utf8 data as a hex string
                                'data': op_return_address_message,
                                'data_hash': md5_hash(op_return_address_message),
                                'valid': 0,
                                'tags': '',
                                'bookmarked': 0,
                                'reviewed': 0,
                                'annotation': '',
                                'format': 0,
                                'nsfw': 0
                            })

                            print('[+] op_return utf8 data found in tx {}:'.format(transaction.hash))
                            print(text)

            except CScriptTruncatedPushDataError as err:
                print('[!] caught 1: {}'.format(err), file=sys.stderr)

        # save the block height so that it can be resumed from later
        with open(os.path.join(args.output_dir, 'last_block.txt'), 'w') as f:
            f.write(str(block.height))

        if block.height % 1000 == 0 or needs_exit:

            # flush files after each 1000 blocks, because fuuuuuuuuuu for not
            data['files']['coinbase_messages'].flush()
            data['files']['address_messages'].flush()
            data['files']['file_address_messages'].flush()
            data['files']['op_return_address_messages'].flush()
            data['files']['op_return_file_address_messages'].flush()

            print('[+] block #{}'.format(block.height))

            if needs_exit:
                print('[!] exiting.'.format(block.height))
                sys.exit(0)

    # close the csv file descriptors
    close_csv_files(data['files'])

if __name__ == '__main__':
    main()
