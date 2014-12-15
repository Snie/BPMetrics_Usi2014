# ![alt text](https://trello-attachments.s3.amazonaws.com/546b696147640bdb69605679/100x123/4b7b05bce8522e39b6a0568d00385c80/logo.png "BPMetrics's Logo") BPMetrics - USI 2014 


###What is BPMetrics
---

BPMetrics is a web app that lets the user upload, list and see some statistics about their business process model/s. 

The goal of this app is to help the user analyse and compare their models in an easy way.

All this is done by using technologies as [Node.js](http://nodejs.org "Node.js homepage"),  [MongoDB](http://www.mongodb.org "MongoDB Homepage") and [Polymer](https://www.polymer-project.org "Polymer Project homepage").

###Requirements
---

Here is the list of requirements to correctly run the web app: 

+  [Java 8](http://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html "Get Java 8"): there is a Java application that computes the metrics of the models, which can be run only on Java 8. 
+ [MongoDB](http://www.mongodb.org "MongoDB Homepage"): BPMetrics saves the accounts, models and statistics on a database, which should be running before starting the web app.
+ [Google Chrome](https://www.google.com/chrome/browser/desktop/index.html "Get Google Chrome"): the whole UI works with [Polymer](https://www.polymer-project.org "Polymer Project homepage") components, which work better and faster on Chrome.
+ [Python 2.5/3.0](https://www.python.org/downloads/ "Get Python"): Some librarires need Python to be installed. 


###Get Started
---
Here are the few necessary steps to get the app going:

1. Get the project from the repository of [BPMetrics](https://github.com/Snie/BPMetrics_Usi2014 "BPMetrics on Git") or use `git clone https://github.com/Snie/BPMetrics_Usi2014.git`
2. Get the necessary dependencies by using
`npm install` or `sudo npm install`
3. Get the database running by using `mongo` (if you don't have MongoDB, here is the [installation guide](http://docs.mongodb.org/manual/installation "MongoDB installation guide"))
4. If it is the first time running the project, then a seed of the database is necessary, by using `node seed.js`
5. Then run the web app by using `npm start`

The web app can be found on `http://localhost:3000`

###Statistics Computation
---
The computed statistics are descriptive statistics (mean, median, mode, standard deviation, variance, range, min, max, sum). They are computed in different aggregation levels, which are: 

+ Collection: statistics computed by comparing all the models of it.
+ Account: statistics computed by comparing the statistics of all the collections of the account.
+ Global: statistics computed by comparing all account statistics.

The library used to do this is [fast-stats](https://github.com/bluesmoon/node-faststats "fast-stats Git page").

###Queue Handling
---
The single uploads from the user are managed by a queue: this means that every single step of the upload has a senquence, to prevent conflicts. The library used to do this is [seq-queue](https://github.com/changchang/seq-queue "seq-queue Git page").

###Team
---
The team of this project is composed of 4 students of the [Università della Svizzera Italiana](http://www.usi.ch "USI homepage"), which are: 

+ *Abdil Cakal*
+ *Andreia Faria Carvalho*
+ *Nicolò Linder*
+ *Sonny Monti*

The team supervisor is/was *Vincenzo Ferme*

###Licensing
---
BPMetrics is licensed under the Apache License, Version 2.0. See [LICENSE](https://github.com/docker/docker/blob/master/LICENSE) for the full license text.

