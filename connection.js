const { 
    default: WAConnection,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys")

const fs = require("fs");
const pino = require("pino");
const { exec } = require("child_process");
const { format } = require('util')

exports.connect = async (start) => {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const level = pino({ level: "silent"})
    const gato = WAConnection({
        logger: level,
        printQRInTerminal: true,
        browser: [ "AlexitoBot", "Firefox", "3.0.0" ],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, level)
        }
    })

    gato.ev.on("connection.update", v => {
        const { connection, lastDisconnect } = v
        
        if (connection === "close") {
            if (lastDisconnect.error.output.statusCode !== 401) {
                start()
            } else {
                exec("rm -rf session", (err, stdout, stderr) => {
                    if (err) {
                        console.error("Error al eliminar el archivo de sesión:", err)
                    } else {
                        console.error("Conexión con WhatsApp cerrada. Escanee nuevamente el código QR!")
                        start()
                    }
                })
            }
        } else if (connection === "open") {
            console.log("Bot está en línea")
        }
    })
    gato.ev.on("creds.update", saveCreds);
}