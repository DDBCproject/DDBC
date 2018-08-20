import re
from collections import OrderedDict

files = OrderedDict()

# images
files['jpeg'] = re.compile('ffd8ff.+ffd9', re.IGNORECASE)
files['png']  = re.compile('89504e470d0a1a0a.+49454e44', re.IGNORECASE)
files['gif']  = re.compile('47494638.+003b', re.IGNORECASE)
# files['bmp']  = re.compile('^424d', re.IGNORECASE)
files['bpg']  = re.compile('^425047fb', re.IGNORECASE)
files['flif'] = re.compile('^464c4946', re.IGNORECASE)
files['tiff'] = re.compile('^(492049|49492a00|4d4d002a|4d4d002b)', re.IGNORECASE)
files['cr2']  = re.compile('49492a00100000004352', re.IGNORECASE)
files['webp'] = re.compile('52494646.+57454250', re.IGNORECASE)
files['exr']  = re.compile('^762f3101', re.IGNORECASE)

# video
files['mpeg'] = re.compile('^000001b', re.IGNORECASE)
files['mp4']  = re.compile('(667479704d534e56|6674797069736f6d)', re.IGNORECASE)
files['mov']  = re.compile('^.{8}(6d6f6f76|66726565|6d646174|77696465|706e6f74|736b6970)', re.IGNORECASE)
files['flv']  = re.compile('^464c56', re.IGNORECASE)
files['avi']  = re.compile('52494646.+41564920', re.IGNORECASE)
files['mlv']  = re.compile('^4d4c5649', re.IGNORECASE)
files['mkv']  = re.compile('^1a45dfa3', re.IGNORECASE)

# audio
files['mp3']  = re.compile('^494433', re.IGNORECASE)
files['wav']  = re.compile('52494646.+57415645', re.IGNORECASE)
files['m4a']  = re.compile('(667479704d3441|667479704d344120)', re.IGNORECASE)
files['ogg']  = re.compile('4f67675300020000', re.IGNORECASE)
files['flac'] = re.compile('664c614300000022', re.IGNORECASE)
files['midi'] = re.compile('^4d546864', re.IGNORECASE)

# compression
files['zip']    = re.compile('(04034b50|504b0304|05b43040|504b0506|504b0708|05b41020)', re.IGNORECASE)
files['gzip']   = re.compile('1f8b0(0|1|2|3|4|5|6|7|8)(01|02|04|08|10|20|40|80)', re.IGNORECASE)
files['7z']     = re.compile('377abcaf271c', re.IGNORECASE)
files['rar']    = re.compile('526172211a07', re.IGNORECASE)
files['bz2']    = re.compile('^425a68', re.IGNORECASE)
files['xar']    = re.compile('^78617221', re.IGNORECASE)
files['tar']    = re.compile('7573746172', re.IGNORECASE)
files['tar.xz'] = re.compile('fd377a585a0000', re.IGNORECASE)
# files['tar.z']  = re.compile('^(1f9d|1fa0)', re.IGNORECASE)
# files['zlib']   = re.compile('^(7801|789c|78da)', re.IGNORECASE)
files['lzfse']  = re.compile('^62767832', re.IGNORECASE)
files['rnc']    = re.compile('^(524e4301|524e4302)', re.IGNORECASE)

# misc
files['pdf']       = re.compile('25504446.+2525454f46', re.IGNORECASE)
files['pwl']       = re.compile('^(b04d4643|e3828596)', re.IGNORECASE)
files['ico']       = re.compile('^00000100', re.IGNORECASE)
files['elf']       = re.compile('^7f454c46', re.IGNORECASE)
files['ps']        = re.compile('^25215053', re.IGNORECASE)
files['iso']       = re.compile('^4344303031', re.IGNORECASE)
files['doc']       = re.compile('(d0cf11e0a1b11ae1|504b030414000600)', re.IGNORECASE)
files['crx']       = re.compile('^43723234', re.IGNORECASE)
files['dmg']       = re.compile('7801730d626260', re.IGNORECASE)
files['dat']       = re.compile('^(504d4f43434d4f43|a90d000000000000|1f8b0800)', re.IGNORECASE)
files['nes']       = re.compile('^4e45531a', re.IGNORECASE)
files['tox']       = re.compile('^746f7833', re.IGNORECASE)
files['xml']       = re.compile('^.+3c3f786d6c20', re.IGNORECASE)
files['wasm']      = re.compile('^0061736d', re.IGNORECASE)
files['deb']       = re.compile('213c617263683e', re.IGNORECASE)
files['rtf']       = re.compile('7b5c72746631', re.IGNORECASE)
files['tape']      = re.compile('^54415045', re.IGNORECASE)
files['utf8']      = re.compile('^efbbbf', re.IGNORECASE)
files['utf7']      = re.compile('^(2b2f7638|2b2f7639|2b2f762b|2b2f762f|2b2f76382d)', re.IGNORECASE)
files['utf32']     = re.compile('^(fffe0000|0000feff)', re.IGNORECASE)
files['mach-o']    = re.compile('^(feedface|feedfacf|fefaedfe|cffaedfe)', re.IGNORECASE)
files['java']      = re.compile('^cafebabe', re.IGNORECASE)
files['exe']       = re.compile('4d5a.+50450000', re.IGNORECASE)
files['swf']       = re.compile('^435753', re.IGNORECASE)

def get_filetype(hex_string):
    for typ, regex in files.items():
        if regex.match(hex_string):
            return typ
    return None

# further references
#   - https://www.garykessler.net/library/file_sigs.html
