//. app.js

//. Run following command to deploy business network before running this app.js
//. $ composer network deploy -p hlfv1 -a ./jugeme-samplenetwork.bna -i PeerAdmin -s secret

var express = require( 'express' ),
    cfenv = require( 'cfenv' ),
    multer = require( 'multer' ),
    bodyParser = require( 'body-parser' ),
    fs = require( 'fs' ),
    ejs = require( 'ejs' ),
    http = require( 'http' ),
    sqlite3 = require( 'sqlite3' ).verbose(),
    app = express();
var appEnv = cfenv.getAppEnv();

const HyperledgerClient = require( './hyperledger-client' );
const client = new HyperledgerClient();

var port = appEnv.port || 3000;

//. スキーマ作成
var db = new sqlite3.Database( ":memory:" );
db.serialize( function(){
  var sql0 = "CREATE TABLE ids( id text, type text, name text, txt text )";
  db.run( sql0 );

  //. Participants 
  http.get( 'http://localhost:' + port + '/users', ( res ) => {
    var body = '';
    res.setEncoding( 'utf8' );

    res.on( 'data', ( chunk ) => {
      body += chunk;
    });
    res.on( 'end', ( chunk ) => {
      var users = JSON.parse( body );
      for( i = 0; i < users.length; i ++ ){
        var user = users[i];
        var sql1 = "INSERT INTO ids( id, type, name, txt ) VALUES( '" + user.id + "', 'participant', 'User', '" + user.name + " " + user.email + "')";
        db.run( sql1 );
      }
    });
  }).on( 'error', ( e ) => {
    console.log( e.message );
  });

  //. Assets 
  http.get( 'http://localhost:' + port + '/items', ( res ) => {
    var body = '';
    res.setEncoding( 'utf8' );

    res.on( 'data', ( chunk ) => {
      body += chunk;
    });
    res.on( 'end', ( chunk ) => {
      var items = JSON.parse( body );
      for( i = 0; i < items.length; i ++ ){
        var item = items[i];
        var sql2 = "INSERT INTO ids( id, type, name, txt ) VALUES( '" + item.id + "', 'asset', 'Item', '" + item.name + " " + item.category + " " + item.desc + "')";
        db.run( sql2 );
      }
    });
  }).on( 'error', ( e ) => {
    console.log( e.message );
  });
});

app.use( multer( { dest: './tmp/' } ).single( 'file' ) );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( express.static( __dirname + '/public' ) );

app.get( '/doc', function( req, res ){
  var template = fs.readFileSync( __dirname + '/public/doc.ejs', 'utf-8' );
  res.write( ejs.render( template, {} ) );
  res.end();
});

app.get( '/', function( req, res ){
  var template = fs.readFileSync( __dirname + '/public/index.ejs', 'utf-8' );
  client.getAllUsers( users => {
    client.getAllItems( items => {
      res.write( ejs.render( template, { users: users, items: items } ) );
      res.end();
    }, error => {
      res.write( ejs.render( template, { users: users, items: [] } ) );
      res.end();
    });
  }, error => {
    client.getAllItems( items => {
      res.write( ejs.render( template, { users: [], items: items } ) );
      res.end();
    }, error => {
      res.write( ejs.render( template, { users: [], items: [] } ) );
      res.end();
    });
  });
});


app.get( '/users', function( req, res ){
  client.getAllUsers( result => {
    res.write( JSON.stringify( result, 2, null ) );
    res.end();
  }, error => {
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

app.get( '/user', function( req, res ){
  var id = req.query.id;

  client.getUser( id, result => {
    res.write( JSON.stringify( result, 2, null ) );
    res.end();
  }, error => {
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

app.post( '/user', function( req, res ){
  var id = req.body.id;
  var name = req.body.name;
  var password = req.body.password;
  var email = req.body.email;
  var user = { id: id, name: name, password: password, email: email };

  client.createUserTx( user, result => {
    res.write( JSON.stringify( { status: 'ok' }, 2, null ) );
    res.end();
  }, error => {
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

app.delete( '/user', function( req, res ){
  var id = req.body.id;

  client.deleteUserTx( id, result => {
    res.write( JSON.stringify( { status: 'ok' }, 2, null ) );
    res.end();
  }, error => {
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

app.get( '/items', function( req, res ){
  client.getAllItems( result => {
    res.write( JSON.stringify( result, 2, null ) );
    res.end();
  }, error => {
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

app.get( '/item', function( req, res ){
  var id = req.query.id;

  client.getItem( id, result => {
    res.write( JSON.stringify( result, 2, null ) );
    res.end();
  }, error => {
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

app.post( '/item', function( req, res ){
  var id = req.body.id;
  var userId = req.body.userId;
  var name = req.body.name;
  var category = req.body.category;
  var price = req.body.price;
  var desc = req.body.desc;
  var imageUrl = req.body.imageUrl;
  var item = { id: id, owner: "resource:me.juge.samplenetwork.Item#" + userId, name: name, category: category, price: price, desc: desc, imageUrl: imageUrl };

  client.createItemTx( item, result => {
    res.write( JSON.stringify( { status: 'ok' }, 2, null ) );
    res.end();
  }, error => {
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

app.delete( '/item', function( req, res ){
  var id = req.body.id;

  client.deleteItemTx( id, result => {
    res.write( JSON.stringify( { status: 'ok' }, 2, null ) );
    res.end();
  }, error => {
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

app.get( '/queryItemsByCategory', function( req, res ){
  var category = req.query.category;
  var condition = { category: category };

  client.queryItemsByCategory( condition, result => {
    res.write( JSON.stringify( result, 2, null ) );
    res.end();
  }, error => {
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

app.get( '/search', function( req, res ){
  var result = [];
  var q = req.query.q;
  var sql = "SELECT id ,type, name from ids where txt like '%" + q + "%'";
  db.all( sql, function( err, rows ){
    res.write( JSON.stringify( rows, 2, null ) );
    res.end();
  });
});


app.listen( port );
console.log( "server starting on " + port + " ..." );


