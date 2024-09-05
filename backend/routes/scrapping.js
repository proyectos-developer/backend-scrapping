const express = require('express')
const router = express.Router()

const {Builder, By} = require ('selenium-webdriver')
require ('selenium-webdriver/chrome')
require ('chromedriver')

const pool = require('../database')

router.get ('/api/scrapping/:nro_ruc', async (req, res) => {
    const {nro_ruc} = req.params
    let ruc, nro_telefono, correo, nombre
    let count = 0
    try {
        const driver = await new Builder().forBrowser('chrome').build()
        await driver.get(`https://apps.osce.gob.pe/perfilprov-ui/ficha/${nro_ruc}`)

        const elements_cero = await driver.findElements(By.className('ficha__content'));
        for (const element of elements_cero) {
            if (count === 0){
                nombre = await element.findElement(By.css('div.page__title')) ? 
                      await element.findElement(By.css('div.page__title')).getText() : '-'
                count = 1
                break;
            }
        }

        const elements_uno = await driver.findElements(By.className('info'));
        for (const element of elements_uno) {
            if (count === 1){
                ruc = await element.findElement(By.css('span.info-value')) ? 
                      await element.findElement(By.css('span.info-value')).getText() : '-'
                count = 2
            }else if (count === 2){
                nro_telefono = await element.findElement(By.css('span.info-value')) ? 
                      await element.findElement(By.css('span.info-value')).getText() : '-'
                count = 3
                break;
            }
        }
        
        const elements_dos = await driver.findElements(By.className('emails-list'));
        for (const element of elements_dos) {
            if (count === 3){
                correo = await element.findElement(By.css('span > a')) ? 
                         await element.findElement(By.css('span > a')).getAttribute('href') : '-'
                count = 4
                break;
            }
        }
        await driver.quit()
        ruc = ruc.toString().split(':'[1])
        const newData  = {nombre, correo, nro_telefono, ruc}
        const new_data = await pool.query ('INSERT INTO data_empresa set ?', [newData])
        const data = await pool.query ('SELECT * FROM data_empresa WHERE id = ?', [new_data.insertId])

        return res.json ({
            data_empresa: data,
            success: true
        })
    } catch (error) {
        console.log (error)
        return res.json ({
            error: error,
            success: false
        })
    }
})

module.exports = router