const users = []


/**
 * Fonction pour stocker un nouvel utilisateur
 * @param id
 * @param username
 * @param room
 * @returns {{error: string}|{users: []}}
 */
const addUser = ( { id, username, room } ) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if( !username || !room ){
        return { error: 'Username or room are required' }
    }

    const existingUser = users.find( (user) => {
        return user.id === id && user.username === username && user.room === room
    })

    if ( existingUser ) {
        return {
            error : 'Username is in use!'
        }
    }

    const user = { id, username, room }
    users.push( user )
    return { user }
}


/**
 * Fonction pour supprimer un utilisateur dans un groupe specifique
 * @param id
 * @returns {*}
 */
const removeUser = ( id ) => {
    const idUser = users.findIndex( (user) => {
        return user.id == id
    })

    if ( idUser != -1 ){
        return users.splice( idUser, 1 )[0]
    }
}

/**
 * Fonction pour obtenir un Utilisateur connecté à partir de son id
 * @param id
 * @returns {{user: *}}
 */
const getUser = ( id ) => {
    const user = users.find( (user) => {
        return user.id == id ? user : undefined
    })

    return { user }
}

/**
 * Fonction Pour recuperer l'ensemeble de clients d'un groupe specifique
 * @param room
 * @returns {[]}
 */

const getUsersInRoom = ( room ) => {
    const usersInRoom = []
    users.find( ( user ) => {
        if( user.room === room.trim().toLowerCase() ){
            usersInRoom.push( user )
        }
    })
    return usersInRoom

}

addUser({
    id: 22,
    username: 'Andrew',
    room: 'South Philly'
    }
)

addUser({
    id: 42,
    username: 'Mike',
    room: 'South Philly'
})

addUser({
    id: 32,
    username: 'Andrew',
    room: 'Center City'
})


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

