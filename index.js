const { connect } = require('./connection')
const { load } = require('./loader')

async function start() {
    try {
        const waBot = await connect(start)
        load(waBot)
    } catch (e) {
        console.log('Hubo un error al iniciar eo bot', e)
    }
}

start()