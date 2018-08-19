# /bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# set a high file limit to account for bitcoind jsonrpc bug
# https://github.com/bitcoin/bitcoin/pull/12274
ulimit -n 10000
echo "[+] set open file limit to $(ulimit -n)"

# for some some of these zmq messages don't run if configured in the .conf
# so instead we will enable them manually as a cli args
echo "[*] launching bitcoind..."
bitcoind \
-conf="${DIR}/bitcoin.conf" \
-datadir="/media/sf_Vboxshare/DDBC/blocks"
