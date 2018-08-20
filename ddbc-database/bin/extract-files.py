import os
import csv
import argparse

def parse_args():
    parser = argparse.ArgumentParser(
                        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument('--input', type=str, default='../data/csv/file_address_messages.csv',
                        help='path to a file_address_messages.csv or address_messages.csv'
                        ' file (default: ../data/csv/file_address_messages.csv).')
    parser.add_argument('--output-dir', type=str, dest='output_dir',
                        default='../data/blockchain-files',
                        help='directory to save recovered files to '
                        '(default: ../data/blockchain-files).')
    parser.add_argument('--min-bytes', type=int, dest='min_bytes', default=0,
    	                help='the minimum size requirement a file must have to be extracted '
    	                '(default: 0).')
    return parser.parse_args()

def main():

	args = parse_args()

	with open(args.input, 'r') as f:

		reader = csv.DictReader(f)
		
		index = 0
		num_saved = 0
		for row in reader:			
			
			folder = 'utf8' if 'address_messages.csv' in args.input else row['filetype']
			folder = os.path.join(args.output_dir, folder)

			ext = 'txt' if 'address_messages.csv' in args.input else row['filetype']
			filename = os.path.join(folder, '{}_{}.{}'.format(str(num_saved).zfill(5), row['transaction_hash'], ext))
			
			if not os.path.isdir(folder):
				os.makedirs(folder)
			
			byts = bytes.fromhex(row['data'])
			if len(byts) >= args.min_bytes:
				with open(filename, 'wb') as f:
					out = f.write(byts)
					print('[+] wrote {} bytes to {}'.format(out, filename))
					num_saved += 1

			index += 1
					
		print('[*] saved {} files to {}'.format(num_saved, args.output_dir))

if __name__ == '__main__':
	main()