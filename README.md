# Doomsday Blockchain

“How will the 21st century be remembered? Beyond the financial hype, people around the world are embedding messages and memorials in blockchains to preserve them forever. Like the Domesday Book, the Doomsday Blockchain carries out a systematic survey that treats this data as a historical and cultural medium. We are are excited to work with Collusion to create a system that allows people to participate in turning these technologies into a public medium for us all.”  

- DDBC, 2018 (see [WIKI](https://github.com/DDBCproject/DDBC/wiki "WIKI"))

People around the world are committing their marriage vows, memorials to the dead, treasured images and promotional material into cryptocurrency blockchains because they promise to be permanent and immutable records for the future. DDBC is a research project that explores blockchains not as financial records but as social and cultural artefacts. Like the Domesday Book which catalogued life in the 11th century and became an important document for historians, the DDBC is a platform for analysing life in the 21st century. It has three components. The DDBC online application allows people to explore, tag, rate and categorise material from the blockchains. In return, participants will receive DDBC coin for entering annotations. The DDBC exhibition is a workspace where people can view other people’s finds and add their own comments. The DDBC workshops will train people to use the application and help them understand how they can contribute to the future of blockchains.

DDBC online application and DDBC coin

We will develop an online application that invites people to collabrate as blockchain researchers. They can discover artefacts inserted into blockchains, tag, rate and categorise findings into a folksonomy such as: Memorials, Love, Greetings, Encrypted, Non-English, Philosophy, Historic, Hello-World, URL, Adverts, Public Shoutout, Ascii Art, SHA1, Cats, Insults and Art. There are currently over 501628 (update) Bitcoin blocks to navigate and explore. Each block may contain a lot of information to unpack filter and review. Part of our research involves mapping out where we expect material could exist and what forms this may take. We will record the info about the development process and pointers to this media within our own blockchain call the DDBC coin. Unlike Bitcoin, DDBC coin won’t require heavy processing as we just want to hold a log blockchain discoveries and review them in context with one another. App users will be rewarded for their activity with DDBC coin that is stored within their own wallet. By issuing wallets and inviting the public to participate in the research process they will share in the monumental task of exploration and annotation. We are currently discussing further uses for the DDBC coin such as linking to other citizen science projects that want to reward participants.

DDBC Workshops

Two workshops with groups from Cambridge will train participants to use the online application, be rewared for their research contributions with DDBC coins, experience blockchain technologies and discus broader implications of prospective uses as well as write ‘themselves’ into public blockchains. 


DDBC Exhibition

The exhibition is a public workspace where visitors can inspect artefacts recovered from blockchains and verify annotations.
Examples will be presented in a series of projected and printed examples. 

An array of data monitors, projected screens and printed reports will be displayed on and around a communication totem
layers of the texts verses and rants will be collaged with visualisations of research discoveriess - in turn these are displayed in different categories. Presentations of discovered artefacts will change dynamically over time and be updated as new material is uncovered. 

DDBC Research
Read more about the ongoing research process in the [WIKI](https://github.com/DDBCproject/DDBC/wiki "WIKI").

The research reportes are published [here] (https://docs.google.com/document/d/1y2J9U27uiFIUZ9RXM2Q54TX0q8ruQzgT5X1j0YPXRws/edit)

-------

The project is currently in development and we need help with the following issues:

1 Multi-transaction parsing. 

We only found 29 images (jpgs, pngs and gif) that we can successfully decode. These are stored in:

https://github.com/DDBCpoject/DDBC/blob/master/ddbc-database/data/csv/utf8_a.tar.gz

We think the problem is that the parser is currently only looking for an image headers and footers within a single transaction. While actually most of the images are being stored across multiple consecutive transaction. So, we need to implement a system hat can identify these multiple transaction insertions and put them together.


2 Hex to ASCII decoding of CSV files. 

The text insertions we have found are stored in the CSV files here:

https://github.com/DDBCpoject/DDBC/blob/master/ddbc-database/data/csv/

The insertions are in the 'data' field of the CSV files but each one is hex encoded. We need a little script that decodes this field into ascii.

 
3 Implement missing detection methods.

We need to fully implement the 5 detection methods outlined in this paper: 

https://www.comsys.rwth-aachen.de/fileadmin/papers/2018/2018_matzutt_bitcoin-contents_preproceedings-version.pdf


4 Build an 'Instagram' Clone Frontend for the data

This is needed to allow users to view, annotate and rate the content in the blockchain. There are many python instagram clones out there. These need to be investigated and tested. 


------------

The DDBC project builds on:

BlockSci https://github.com/citp/BlockSci

Messages from the Mines https://brangerbriz.com/portfolio/messages-from-the-mines

Python Blockchain Parser https://github.com/alecalve/python-bitcoin-blockchain-parser
