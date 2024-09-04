const express = require('express')
const router = express.Router()

const {Builder, By} = require ('selenium-webdriver')
require ('selenium-webdriver/chrome')
require ('chromedriver')


const pool = require('../database')
const { isLoggedIn } = require('../lib/auth')

router.get ('/api/scrapping/:nro_ruc', async (req, res) => {
    const {nro_ruc} = req.body

    try {
        const driver = await new Builder().forBrowser('chrome').build()
        await driver.get(`https://apps.osce.gob.pe/perfilprov-ui/ficha/${nro_ruc}`)

        const elements = await driver.findElements(By.className('profile-content'));
        
        for (const element of elements) {
            const ruc = await element.findElement(By.tagName('info-value')).getText()
            const nro_telefono = await element.findElement(By.tagName('info-value')).getText()
            const correo = await element.findElement(By.tagName('emails')).getText()
            return res.json ({
                nro_ruc: ruc,
                nro_telefono: nro_telefono,
                correo: correo
            })
        }
    } catch (error) {
        return res.json ({
            error: error,
            success: false
        })
    }
})

module.exports = router