/**
 * etablir une connexion du client vers le serveur
 */
/**
 * Recuperer les informations de la nouvelle connexion
 */
const socket = io()

/**
 * Recuperer le contenu du corps de la requête
 */
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})
/**
 * ecouter un evenement du serveur
 */
// socket.on( 'countUpdated', (count) => {
//     console.log( 'The count has been updated!', count )
// })
socket.on('message', (message) => {
    /**
     * transformer le modèle en html en passant les donnees en paramètres
     * @type {undefined|void|*}
     */
    const html = Mustache.render(messageClientTemplate, {
        username: message.username,
        message: message.text,
        /**
         * utiliser la bibliothèque moment.js pour l'horodatage
         * generer une date a partir de la date du système
         */
        createAt: moment(message.createAt).format('h:mm:ss a')
    })
    /**
     * Injecter le html dans le DOM a l'emplacement bien specifié
     */
    $message.insertAdjacentHTML('beforeend', html)

    console.log(message)
})

/**
 * creer une relation entre un page html et un fichier js et ecouter un evenement de click
 */
// document.querySelector( '#increment').addEventListener( 'click', () => {
//     socket.emit( 'increment')
//     console.log( 'Clicked' )
//
// })
document.querySelector('#message-form').addEventListener('submit', (e) => {
    /**
     * J'en sais pas grand chose
     */
    e.preventDefault()
    /**
     * e.target => pour recuperer le cible sur lequel on ecoute un evenement
     * e.target.elements => accéder a tous les entrées de la cible en question
     * e.target.elements.message => pour obtenir un element de la cible parmi tant d'autres
     * e.target.elements.message.value => pour obtenir la valeur de l'entree en question
     */
    const messageClient = e.target.elements.message.value
    /**
     * envoi d'un evenement de message du client au serveur en utilisant socket
     */
    socket.emit('sendMessage', messageClient, (infos) => {
        console.log(infos)
    })
})
/**
 * envoi d'un evenement de location du client au serveur
 * completer l'envoi d'un evenement avec une fonction de rappel
 */
socket.on('locationMessage', (message) => {
    /**
     * Rendre un modèle sur la page html avec des parametres dans {{xx}}
     * @type {undefined|void|*}
     */
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        /**
         * appliquer l'horodatage sur la date actuelle
         */
        createAt: moment(message.createdAt).format('h:mm:ss a')
    })
    /**
     * Inserer une modèle dans une partie de la page html
     */
    //$locationMessage.insertAdjacentHTML( 'beforeend', html )
    $message.insertAdjacentHTML('beforeend', html)

    console.log(message)
})

/**
 * stocker une entrée du HTML dans une varialbe
 */
const $message = document.querySelector('#message')
const $sendLocation = document.querySelector('#send-location')
const $locationMessage = document.querySelector("#location")
const $sidebar = document.querySelector('#sidebar')

/**
 * Recuperer le modèle avec son contenu
 * @type {string}
 */
const locationMessageTemplate = document.querySelector("#location-template").innerHTML
const messageClientTemplate = document.querySelector('#messages').innerHTML
const sidebarTemplate = document.querySelector( '#sidebar-template').innerHTML


$sendLocation.addEventListener('click', () => {

    /**
     * desactiver le bouton en ajoutant un attribut
     */
    $sendLocation.setAttribute('disabled', 'disabled')

    /**
     * Tester si la position n'est pas vide
     */
    if (!navigator.geolocation)
        console.log('Geolocalisation is not supported by your browser')

    /**
     * recuperer la position actuelle du navigateur
     */
    navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        console.log({latitude, longitude})
        /**
         * envoi d'un evenement de location du client au serveur
         * completer l'envoi d'un evenement avec une fonction de rappel
         */
        socket.emit('sendLocation', {latitude, longitude}, (infos) => {
            console.log(infos)
            /**
             *Supprimer l'attribut lier a la desactivation
             */
            $sendLocation.removeAttribute('disabled')
        })
    })
})

/**
 * envoyer un evenement join qui informe les clients connectés et le serveur d'une nouvelle connexion
 */
socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
/**
 * Ecouter l'evenement roomData depuis le serveur pour la mise de la barre laterale
 */
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render( sidebarTemplate, {
        room,
        users
    })

    /**
     * Mettre à jour le sidebar sans faire insertion a chaque fois mais en faisant la mise a jour par une affectation
     * @type {undefined|void}
     */
    $sidebar.innerHTML = html

})
