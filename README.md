# Doomsday Blockchain

“How will the 21st century be remembered? Beyond the financial hype, people around the world are embedding messages and memorials in blockchains to preserve them forever. Like the Domesday Book, the Doomsday Blockchain carries out a systematic survey that treats this data as a historical and cultural medium. We are are excited to work with Collusion to create a system that allows people to participate in turning these technologies into a public medium for us all.”  

- DDBC, 2018

People around the world are committing their marriage vows, memorials to the dead, treasured images and promotional material into cryptocurrency blockchains because they promise to be permanent and immutable records for the future. DDBC is a research project that explores blockchains not as financial records but as social and cultural artefacts. Like the Domesday Book which catalogued life in the 11th century and became an important document for historians, the DDBC is a platform for analysing life in the 21st century. It has three components. The DDBC online application allows people to explore, tag, rate and categorise material from the blockchains. In return, participants will receive DDBC coin for entering annotations. The DDBC exhibition is a workspace where people can view other people’s finds and add their own comments. The DDBC workshops will train people to use the application and help them understand how they can contribute to the future of blockchains.

DDBC online application and DDBC coin
We will develop an online application that allows people to become blockchain researchers. They can discover material embedded within the blockchains, tag it, rate it and categorise into a folksonomy such as: Memorials, Love, Greetings, Encrypted, Non-English, Philosophy, Historic, Hello-World, URL, Adverts, Public Shoutout, Ascii Art, SHA1, Cats, Insults and Art. There are currently over 501628 Bitcoin blocks to navigate and explore. Each block may contain a lot of information to unpack filter and review. Part of our research involves mapping out where we expect material could exist and what forms this may take. We will record the info about the development process and pointers to this media within our own blockchain call the DDBC coin. Unlike Bitcoin, DDBC coin won’t require heavy processing as we just want to hold a log blockchain discoveries and review them in context with one another. App users will be rewarded for their activity with DDBC coin that is stored within their own wallet. By issuing wallets and inviting the public to participate in the research process they will share in the monumental task of exploration and annotation. We are currently discussing further uses for the DDBC coin such as linking to other citizen science projects that want to reward participants.

DDBC Workshops
Two workshops with groups from Cambridge will train participants to use the online application, receive DDBC coins, experience blockchain technologies and discus broader implications of its use as well as write ‘themselves’ into public blockchains. 


DDBC Exhibition
The exhibition is a public workspace where visitors can look at the contents of the blockchain as a series of projections and printed material. The current concept is to use four 4k projectors to display a selection of the texts snippets and recognisable images discovered by the researchers - these are displayed within different categories of content. These projections will change dynamically over time and as new material is added. 



The DDBC project builds on Messages from the Mines https://brangerbriz.com/portfolio/messages-from-the-mines


## Install

This repository is comprised entirely of git submodules of other repositories. 

- `mftm-backend`: The Node.js backend server that hosts our frontend, REST API, and our internal message review tool.
- `mftm-frontend` (located in `mftm-backend/www/mftm-frontend`): The UI for exploring the blockchain messages (pictured above).
- `mftm-database`: Python code for extracting messages from the blockchain (using `bitcoind`'s `.dat` files) and constructing the MySQL database used by `mftm-backend`. 

```bash
# clone this repo
git clone https://github.com/brangerbriz/messages-from-the-mines
cd messages-from-the-mines

# recursively init and download the submodules
git submodule update --init --recursive

# you will notice that there are 4 submodules, two in the parent
# repo, each that contains one additional submodule.
git submodule status --recursive
```

These install instructions are for Ubuntu 16.04. Other OSes may work but are not officially supported: here be dragons.

### Setting up the MySQL Database

```bash
# install mysql and optional GUI helpers
sudo apt update
sudo apt install mysql-server mysql-workbench
```

Now download the latest `messages_from_the_mines` database backup from [here (direct download)](https://github.com/brangerbriz/mftm-database/releases/download/data/latest.sql.gz). Unzip that file and you should get an `.sql` file like `2018-04-18.sql`.

```bash
# download the latest version of the database
curl -L https://github.com/brangerbriz/mftm-database/releases/download/data/latest.sql.gz > latest.sql.gz

# unzip it
gunzip latest.sql.gz

# import the database backup (be sure to use the correct path to your database file)
# this will create a new Database schema called messages_from_the_mines
mysql -u root -p < latest.sql
```

You may optionally create a new MySQL user to interface with the `messages_from_the_mines` database only. This is probably a good idea, as you have to save your database username/password in plaintext in `mftm-backend/config.json` and `mftm-database/config.json` (if actually want to parse the blockchain from this computer). This process is trivial using MySQL Workbench. Just be sure that your new user has full access permissions to the `messages_from_the_mines` database schema.

### Setting up the `mftm-backend` Node.js server

Once you've configured the MySQL database, detailed instructions to setup the backend server can be found in the [`mftm-backend/README.md`](https://github.com/brangerbriz/mftm-backend) file. You should now follow those instructions before returning here.

## Run

### The backend

In one terminal, run:

```
# start the bitcoin daemon
cd mftm-backend
./start_bitcoind.sh
```

In another terminal run:

```
# still inside mftm-backend
node server
```

### The Frontend/UI

So, this really isn't the most elegant solution... but it's the one we are supporting as of right now. Because of an HTTP (not HTTPS) call that we have to make to use the ipstack geo-ip API, browsers throw a "Mixed Content" error if loaded over HTTPS. We built the whole thing to run on HTTPS (w/ basic auth and everyting) and to run it via HTTP would cause some security concerns, as people could read the contents of our `mftm-backend/www/auth.js` file. For now, our solution is to open `mftm-backend/www/mftm-frontend/index.html` in Firefox using `file://` and NOT serve the UI.

```
# from inside this repo's root

# copy the auth.js file to where Nick originally expected it to
# be while he was dev'n
cp mftm-backend/www/auth.js mftm-backend/www/mftm-frontend/js/auth.js

firefox mftm-backend/www/mftm-frontend/index.html
```

Sorry folks, that's just the way it goes sometimes.

## More Info

![Messages from the Mines Banner/Poster](.images/banner.png)
