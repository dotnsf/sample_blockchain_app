# samplenetwork

## Overview

Sample blockchain application which use Hyperledger Fabric v1.0 and Hyperledger Composer.

## Pre-requisite

### Node.js V6.x

- https://nodejs.org/

- V8.x is not supported by Hyperledger Composer

### Docker

- https://docker.github.io/

## Setup

### Hyperledger Composer CLI and Fabric tools

- Install Composer CLI by executing the following command in the terminal window

`$ sudo install -g composer-cli`

- Install Fabric support tools

`$ mkdir <working directory>
$ cd <working directory>
$ curl -O https://raw.githubusercontent.com/hyperledger/composer-tools/master/packages/fabric-dev-servers/fabric-dev-servers.zip
$ unzip fabric-dev-servers.zip`

### Hyperledger Fabric v1.0

- Install Hyperledger Fabric v1.0 docker images

`$ ./downloadFabric.sh`

- Start Hyperledger Fabric v1.0

`$ ./startFabric.sh`

- Create Composer default profile

`$ ./createComposerProfile.sh`

### Hyperledger Composer

- Install Hyperledger Composer docker images

`$ curl -sSL https://hyperledger.github.io/composer/install-hlfv1.sh | bash`

- Start Hyperledger Composer

`$ ./composer.sh`

### Application clone/download

- $ git clone https://github.com/dotnsf/xxx

- $ cd xxx

### Deploy Hyperledger Business Network

- $ composer network deploy -p hlfv1 -a ./jugeme-samplenetwork.bna -i PeerAdmin -s secret

### Launch applition

- $ node app

## Licensing

This code is licensed under MIT.

## Copyright

2017 K.Kimura @ Juge.Me all rights reserved.

