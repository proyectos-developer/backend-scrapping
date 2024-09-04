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

        const elements = await driver.findElements(By.className('info'));
        for (const element of elements) {
            const nro_ruc = await element.findElement(By.tagName('info-value')).getText()
            const nro_telefono = await element.findElement(By.tagName('info-value')).getText()
            const correo = await element.findElement(By.tagName('emails')).getText()
        }
        return res.json ({
            nro_ruc: nro_ruc,
            nro_telefono: nro_telefono,
            correo: correo
        })
    } catch (error) {
        return res.json ({
            error: error,
            success: false
        })
    }
})

router.post ('/api/negocio/:id_negocio', async (req, res) => {
    const {nombre_negocio, nro_ruc, nombre_contacto, correo, nro_telefono, url_logo} = req.body
    const {id_negocio} = req.params

    try {
        const updateNegocio = {nombre_negocio, nro_ruc, nombre_contacto, correo, nro_telefono, url_logo}
        await pool.query ('UPDATE negocio_empresa set ? WHERE id = ?', [updateNegocio, id_negocio])
        const negocios = await pool.query ('SELECT * FROM negocio_empresa WHERE id = ?', [id_negocio])

        return res.json ({
            negocio: negocios[0],
            success: true
        })
    } catch (error) {
        console.log (error)
        return res.json ({
            error: error,
            success: false,
            negocios: []
        })
    }
})

router.get ('/api/negocios/search/:search/order_by/:order_by/:order/:begin/:amount', async (req, res) => {
    const {search, order_by, order, begin, amount} = req.params
    try {
        if (search === '0' && order_by === '0'){
            const negocios = await pool.query (`SELECT * FROM negocio_empresa ORDER BY nombre_negocio ASC LIMIT ${begin},${amount}`)
            if (parseInt(begin) === 0){
                const total_negocios = await pool.query ('SELECT COUNT (id) FROM negocio_empresa')
    
                return res.json ({
                    total_negocios: total_negocios[0][`COUNT (id)`],
                    negocios: negocios,
                    success: true
                })
            }else{
                return res.json ({
                    negocios: negocios,
                    success: true
                })
            }
        }else if (search === '0' && order_by !== '0'){
            const negocios = await pool.query (`SELECT * FROM negocio_empresa ORDER BY ${order_by} ${order} 
                    LIMIT ${begin},${amount}`)
            if (parseInt(begin) === 0){
                const total_negocios = await pool.query ('SELECT COUNT (id) FROM negocio_empresa')
    
                return res.json ({
                    total_negocios: total_negocios[0][`COUNT (id)`],
                    negocios: negocios,
                    success: true
                })
            }else{
                return res.json ({
                    negocios: negocios,
                    success: true
                })
            }
        }else if (search !== '0' && order_by === '0'){
            const negocios = await pool.query (`SELECT * FROM negocio_empresa WHERE (nombre_negocio LIKE 
                    '%${search}%' OR nombre_contacto LIKE '%${search}%') ORDER BY nombre_negocio ASC LIMIT ${begin},${amount}`)
            if (parseInt(begin) === 0){
                const total_negocios = await pool.query ('SELECT COUNT (id) FROM negocio_empresa')
    
                return res.json ({
                    total_negocios: total_negocios[0][`COUNT (id)`],
                    negocios: negocios,
                    success: true
                })
            }else{
                return res.json ({
                    negocios: negocios,
                    success: true
                })
            }
        }else if (search !== '0' && order_by !== '0'){
            const negocios = await pool.query (`SELECT * FROM negocio_empresa WHERE (nombre_negocio LIKE 
                    '%${search}%' OR nombre_contacto LIKE '%${search}%') ORDER BY ${order_by} ${order} LIMIT ${begin},${amount}`)
            if (parseInt(begin) === 0){
                const total_negocios = await pool.query ('SELECT COUNT (id) FROM negocio_empresa')
    
                return res.json ({
                    total_negocios: total_negocios[0][`COUNT (id)`],
                    negocios: negocios,
                    success: true
                })
            }else{
                return res.json ({
                    negocios: negocios,
                    success: true
                })
            }
        }
    } catch (error) {
        console.log (error)
        return res.json ({
            error: error,
            success: false,
            negocios: []
        })
    }
})

router.get ('/api/negocio/:id_negocio', async (req, res) => {
    const {id_negocio} = req.params

    try {
        const negocios = await pool.query (`SELECT * FROM negocio_empresa WHERE id = ?`, [id_negocio])

        return res.json ({
            negocio: negocios[0],
            success: true
        })
    } catch (error) {
        console.log (error)
        return res.json ({
            error: error,
            success: false,
            negocio: {}
        })
    }
})

router.get ('/api/delete/negocio/:id_negocio', async (req, res) => {
    const {id_negocio} = req.params

    try {
        await pool.query ('DELETE FROM negocio_empresa WHERE id = ?', [id_negocio])
        const negocios = await pool.query ('SELECT * FROM negocio_empresa ORDER BY nombre_negocio ASC LIMIT 0,16')
        const total_negocios = await pool.query ('SELECT COUNT (id) FROM negocio_empresa')

        return res.json ({
            total_negocios: total_negocios[0][`COUNT (id)`],
            negocios: negocios,
            success: true
        })
    } catch (error) {
        console.log (error)
        return res.json ({
            error: error,
            negocios: [],
            success: true
        })
    }
})

module.exports = router