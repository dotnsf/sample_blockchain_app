//. hyperledger-client.js

//. Run following command to deploy business network before running this app.js
//. $ composer network deploy -p hlfv1 -a ./jugeme-samplenetwork.bna -i PeerAdmin -s secret


const NS = 'me.juge.samplenetwork';
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

const HyperledgerClient = function() {
  var vm = this;
  vm.businessNetworkConnection = null;
  vm.businessNetworkDefinition = null;

  vm.prepare = (resolved, rejected) => {
    if (vm.businessNetworkConnection != null && vm.businessNetworkDefinition != null) {
      resolved();
    } else {
      console.log('HyperLedgerClient.prepare(): create new business network connection');
      vm.businessNetworkConnection = new BusinessNetworkConnection();
      const connectionProfile = 'hlfv1';
      const businessNetworkIdentifier = 'jugeme-samplenetwork';
      const participantId = 'PeerAdmin';
      const participantPwd = 'secret';
      return vm.businessNetworkConnection.connect(connectionProfile, businessNetworkIdentifier, participantId, participantPwd)
      .then(result => {
        vm.businessNetworkDefinition = result;
        resolved();
      }).catch(error => {
        console.log('HyperLedgerClient.prepare(): reject');
        rejected(error);
      });
    }
  };

  vm.createUserTx = (user, resolved, rejected) => {
    vm.prepare(() => {
      //let currentDate = new Date();
      let factory = vm.businessNetworkDefinition.getFactory();
      let transaction = factory.newTransaction(NS, 'createUserTx');
      transaction.id = participant.id;
      transaction.name = participant.name;
      transaction.password = participant.password;
      transaction.email = participant.email;
      return vm.businessNetworkConnection.submitTransaction(transaction)
      .then(result => {
        resolved(result);
      }).catch(error => {
        console.log('HyperLedgerClient.createUserTx(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.deleteUserTx = (id, resolved, rejected) => {
    vm.prepare(() => {
      //let currentDate = new Date();
      let factory = vm.businessNetworkDefinition.getFactory();
      let transaction = factory.newTransaction(NS, 'deleteUserTx');
      transaction.id = id;
      return vm.businessNetworkConnection.submitTransaction(transaction)
      .then(result => {
        resolved(result);
      }).catch(error => {
        console.log('HyperLedgerClient.deleteUserTx(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.createItemTx = (item, resolved, rejected) => {
    vm.prepare(() => {
      //let currentDate = new Date();
      let factory = vm.businessNetworkDefinition.getFactory();
      let transaction = factory.newTransaction(NS, 'createItemTx');
      transaction.id = item.id;

      //. Reference は Relationship を使って指定
      var n = item.owner.indexOf( '#' );
      var userId = item.owner.substring( n + 1 );
      transaction.owner = factory.newRelationship( NS, "User", userId );

      transaction.name = item.name;

      //. DateTime 型の場合、
/*
      var dt = new Date();
      dt.setTime( Date.parse( item.created ) );
      transaction.created = dt;
*/

      transaction.category = item.category;
      transaction.price = item.price;
      transaction.desc = item.desc;
      transaction.imageUrl = item.imageUrl;
      return vm.businessNetworkConnection.submitTransaction(transaction)
      .then(result => {
        resolved(result);
      }).catch(error => {
        console.log('HyperLedgerClient.createItemTx(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.deleteItemTx = (id, resolved, rejected) => {
    vm.prepare(() => {
      //let currentDate = new Date();
      let factory = vm.businessNetworkDefinition.getFactory();
      let transaction = factory.newTransaction(NS, 'deleteItemTx');
      transaction.id = id;
      return vm.businessNetworkConnection.submitTransaction(transaction)
      .then(result => {
        resolved(result);
      }).catch(error => {
        console.log('HyperLedgerClient.deleteItemTx(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.getUser = (id, resolved, rejected) => {
    vm.prepare(() => {
      return vm.businessNetworkConnection.getParticipantRegistry(NS + '.User')
      .then(registry => {
        return registry.resolve(id);
      }).then(user => {
        resolved(user);
      }).catch(error => {
        console.log('HyperLedgerClient.getUser(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.getAllUsers = ( resolved, rejected ) => {
    vm.prepare(() => {
      return vm.businessNetworkConnection.getParticipantRegistry(NS + '.User')
      .then(registry => {
        return registry.getAll();
      })
      .then(users => {
        let serializer = vm.businessNetworkDefinition.getSerializer();
        var result = [];
        users.forEach(user => {
          result.push(serializer.toJSON(user));
        });
        resolved(result);
      }).catch(error => {
        console.log('HyperLedgerClient.getAllUsers(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.getItem = (id, resolved, rejected) => {
    vm.prepare(() => {
      return vm.businessNetworkConnection.getAssetRegistry(NS + '.MyAsset')
      .then(registry => {
        return registry.resolve(id);
      }).then(item => {
        resolved(item);
      }).catch(error => {
        console.log('HyperLedgerClient.getItem(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.getAllItems = (resolved, rejected) => {
    vm.prepare(() => {
      return vm.businessNetworkConnection.getAssetRegistry(NS + '.Item')
      .then(registry => {
        return registry.getAll();
      })
      .then(items => {
        let serializer = vm.businessNetworkDefinition.getSerializer();
        var result = [];
        items.forEach(item => {
          result.push(serializer.toJSON(item));
        });
        resolved(result);
      }).catch(error => {
        console.log('HyperLedgerClient.getAllItems(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.queryItemsByCategory = (condition, resolved, rejected) => {
    if ( condition.companyName ) {
      vm.prepare(() => {
        let params = {
          companyName: companyName
        };
        return vm.businessNetworkConnection.query('ASSETS_BY_CATEGORY', params)
        .then(items => {
          let serializer = vm.businessNetworkDefinition.getSerializer();
          var result = [];
          items.forEach(item => {
            result.push(serializer.toJSON(item));
          });
          resolved(result);
        }).catch(error => {
          console.log('HyperLedgerClient.query(): reject');
          rejected(error);
        });
      }, rejected);
    } else {
      // use getAll instead of query (TODO: implement filtering)
      vm.getAllAssets(resolved, rejected);
    }
  };
}

module.exports = HyperledgerClient;
