# content-curator

In the past few days you may have seen comment replies by a little fella u/rec_curator. u/rec_curator is a bot that monitors a particular [smart contract](https://github.com/RECDAO/contracts/blob/master/contracts/ContentDAO.sol) on the Ethereum blockchain. This particular smart contract is a type of [prediction market](https://en.wikipedia.org/wiki/Prediction_market) for Reddit submissions. An interface to the smart contract has also been developed and is [live and usable here](http://curator.recdao.org:3000).

&nbsp;

### **What does "prediction market for Reddit submissions" even mean?**

Prediction markets allow participants to bet on the future outcome of a question. In this case the market is asking: **is this content that the r/ethtrader community wants to see?** Anyone is then free to bet (stake ETH or another token) to either support that content or reject it. At any given time, a market for a particular post will be either in favour of it or against depending on which side has staked more. The side that is winning is the side that was willing to risk more. The market will end currently 12 hours after it was opened at which point any contributor to the winning side can withdraw their original stake plus their share of the losing side. While prediction markets have been proposed for all kinds of uses work on the one was prompted by [this ethresear.ch thread by u/vbuterin](https://ethresear.ch/t/prediction-markets-for-content-curation-daos/1312).

&nbsp;

### **How can r/ethtrader use this?**

Requiring content to prove it's "support" via a prediction market is a sustainable, distributed, and transparent way to fight spam and improve quality. Initially a piece of submitted content has no market. It may stay that way and not receive either support or a rejection challenge. In such cases I would suggest the content proceed on it's normal lifecycle through the Reddit system (use Reddit's algorithms to determine length of time on the front page, etc.). A submission can also be challenged, ie. receive a stake large enough to flip it's state to rejected. The bot, u/rec_curator watching for these on-chain events would respond by replying that the content has received this challenge and that as a result would be removed within an hour if it is not subsequently supported. Supporting would also be an opportunity for anyone to win the rejectors stake. Similarly a market can opened with a supporting stake and the bot would notify the thread with a reply indicating that a market had been opened in support of the content. In either case the bot's reply would be updated with the current state of the market if it "flips". Any flip to "rejected" would trigger a 1 hour delay before removal.

&nbsp;

### **How do you get the staking token RECT**

The system is currently developed to work with an Ethereum community token, RECT. This token is distributed to you based on your karma in the top 4 Ethereum related subreddits when you link an Ethereum address to your Reddit username by [registering](https://recdao.github.io). There is no ICO - you are just awarded the token for having been here and contributed to the community.

&nbsp;

### **Is it finished?**

Haha, no. Currently the smart contract is deployed on the rinkeby testnet so any RECT or ETH used are not *real*. There are definitely improvements to be made to the system. Details on these and the current design can be found on [this thread](https://www.reddit.com/r/recdao/comments/87jsa1/recdao_prediction_market_content_curator/). Any contribution to the mechanism, design, or any part of this experiment including how we communicate about it, are greatly appreciated.

&nbsp;

### **Is there more?**

Yes, the r/recdao project is about developing tools to improve this communities use of Reddit. In addition to the [curator](http://curator.recdao.org:3000), there is a [browser plugin](https://github.com/RECDAO/extension) that allows *direct on-chain* tipping as well as on-chain up/down voting of content. The RECT token as well as the on-chain registry of usernames and karma are controlled by a [dao](https://en.wikipedia.org/wiki/Decentralized_autonomous_organization). See the RECDAO sidebar section on this sub or the r/recdao sub itself for more details.
