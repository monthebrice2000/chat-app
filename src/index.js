/**
 * create a "start" script to start the app using node ==> CLI : npm run start
 * install nodemon and a development dependency
 * create a "dev" script to start the app using nodemon ==> CLI : npm run dev
 * run both scripts to test your work!
 */


/**
 * initialize and install an express web server
 * @type {createApplication}
 */
const express = require('express')

/**
 * create and install path module
 * @type {path.PlatformPath | path}
 */
const path = require( 'path' )

/**
 * initialize and install a server
 */
const http = require( 'http')

/**
 * installet un web socket io
 */
const socketio = require( 'socket.io' )

/**
 * Importer la fonction generateMessage dans ce fichier
 */
const { generateMessage, generateLocationmessage } = require ( './utils/messages' )

/**
 * Charger la bibliothèque pour la gestion du temps et des dates
 */
const moment = require( 'moment' )

/**
 * charger la bibliothèque pour la gestion des requête http
 */
const qs = require ( 'qs' )

/**
 * Importer les fonctions liés aux utilisateurs
 */
const { addUser, removeUser, getUser, getUsersInRoom } = require ( './utils/users')

/**
 * Setup a new express server after serve up the public directory
 * @type {*|app}
 */
const app = express()

/**
 * creer un nouveau serveur auquel on connecte une application
 */
const server = http.createServer( app )

/**
 * charger le socket io dans  le serveur // creer une instance du socketio dans le serveur
 */
const io = socketio( server )


/**
 * Donnees à transferer à tous les clients connectés
 */
//let count = 0
const message = 'Welcome!'

/**
 * Serve up the public directory (no use set method)
 */
app.use( express.static( path.join( __dirname, '../public') ) )

/**
 * Ecouter un evenement de connexion provenant d'un client
 */
io.on( 'connection' , (socket) => {
    console.log( 'New WebSocket Connection')

    /**
     *Emmetre un evènement( envoie d'une donnee ) a un seul client quand le serveur detecte une nouvelle connexion
     */
    //socket.emit( 'countUpdated', count)
    //socket.emit( 'message', generateMessage(message) )

    /**
     * Informer les autres clients connectés sauf l'instance de ce client a ecouter un nouvel evenement
     * envoyer un evenement de message ( connexion d'un nouvel client ) a tous les autres clients deja connectés
     */
    //socket.broadcast.emit( 'message', generateMessage ('A new User Has Joined!!') )

    /**
     * Ecouter l'evenement join de la nouvelle connexion
     */
    socket.on('join', ( { username, room }, callback ) => {
        /**
         * Joindre la socket du serveur ecoutant le client a un groupe specifique bien déterminé
         */
        socket.join( room )

        /**
         * Ajouter un nouvel client et une nouvelle classe
         * Fonction addUser renvoit par defaut un objet qui contient les variables de retour de cette fonction
         */
        const { error, user } = addUser( { id:socket.id, username, room })
        /**
         * Renvoi error si le nouvel utilisateur existe deja ou si le nom de l'utilisateur / du groupe est vide
         */
        if( error ){
            return callback(error)
        }
        /**
         * Ementtre un evenement de message à un client specifique après l'ecoute d'une premiere connexion
         */
        socket.emit( 'message', generateMessage( user.username, message ) )
        /**
         * envoyer l'evènement de message a tous les clients specifique a un groupe room sauf le client courant
         */
        socket.broadcast.to( user.room ).emit( 'message', generateMessage (user.username, `${user.username} has joined the room!`) )

        /**
         * Emmettre un evenement roomData pour la mise a jour de la barre latérale
         */
        io.to(user.room ).emit( 'roomData', {
            room: user.room,
            users: getUsersInRoom( user.room )
        })
        callback()
    })


    /**
     * ecouter un evenement depuis le client specifique
     */
    // socket.on( 'increment', () => {
    //     count ++
    //     /**
    //      * renvoyer un evenement a tous les clients
    //      */
    //     io.emit( 'countUpdated', count )
    // })
    socket.on( 'sendMessage', (messageClient,callback) => {

        /**
         * Recuperer le client connecté + groupe lié à ce socket
         */
        const { user } = getUser( socket.id )

        /**
         * Emmettre un evenement de message a tous les utilisateurs connectés a un meme groupe
         */
        io.to(user.room).emit( 'message', generateMessage( user.username, messageClient ) )
        callback( 'Message Delivered!')
    })

    /**
     * ecouter un evenement de location du client et envoye a tous les autres clients
     * rappeler la fonction de rappel en lui transferant les donnees une fois l'ecoute deja faite
     * Notifier le client que tout s'est bien passé
     */
    socket.on( 'sendLocation', ( coords, callback ) => {

        /**
         * Recuperer le client connecté + groupe lié à ce socket
         */
        const { user } = getUser( socket.id )

        /**
         * Emmettre un evenement de message a tous les utilisateurs connectés a un meme groupe
         */
        io.to( user.room ).emit( 'locationMessage', generateLocationmessage ( user.username, `http://google.com/maps/?q=${coords.latitude},${coords.longitude}` ) )
        callback( generateLocationmessage( user.username, 'Location delivered' ) )
    })

    /**
     * envoyer un evenement a tous les clients connectés qu'un client est deconnecté
     * ecouter l'evenement de deconnection par defaut specifique a un client
     */
    socket.on( 'disconnect', () => {

        /**
         * Suoprimer un client d'un groupe
         */
        const user = removeUser( socket.id )
        if ( user ){
            /**
             * envoyer l'évènement de partage de message sur la deconnexion d'un client a tous les clients connectés
             */
            io.to( user.room ).emit( 'message', generateMessage (user.username, `${user.username} has left!` ) )

            /**
             * Emmettre un evenement roomData pour la mise a jour de la barre latérale
             */
            io.to(user.room ).emit( 'roomData', {
                room: user.room,
                users: getUsersInRoom( user.room )
            })
        }
    })


})


/**
 * Listen on port 3000 // creer le port d'ecoute du serveur
 */
server.listen( 3000 || process.env.PORT , () => {
    console.log( generateMessage ( '', 'Server is running').text , moment (generateMessage('', '').createdAt ).format('h') )
})
