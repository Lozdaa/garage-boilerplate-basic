import { Router, type Router as ExpressRouter } from 'express'
import { adminDb } from '../lib/firebase'
import { evaluateReadings } from '../lib/pendantRules'
import { deviceAuth } from '../middleware/deviceAuth'
import { HttpError } from '../lib/errors'

const router: ExpressRouter = Router()

// This is route
// POST /api/devices/:deviceId/readings

router.post('/:deviceID/readings', deviceAuth, async (req, res, next) => {
    try {
        const pendantID = req.params.deviceID
        if (typeof pendantID !== 'string' || pendantID === '') {
            return next(HttpError.badRequest('Missing device id'))
        }
        const pendantRef = adminDb.collection('pendants').doc(pendantID) // the route so for example: pendants/pi-01
        const now = new Date()

        //0. Checking what pendant was before reading
        const previous = (await pendantRef.get()).data()
        const wasInDanger = previous?.dangerActive === true

        // 1. Evaluating the new readings
        const evaluation = evaluateReadings(req.body)
        const inDanger = evaluation.dangers.length > 0

        // 2. Logging the pi/pendant's reading
        await adminDb.collection('readings').add({
            ...req.body, // this is all data that the pi sends out
            pendantID,
            dangers: evaluation.dangers,
            warnings: evaluation.warnings,
            receivedAt: now,
            _schemaVersion: 1,
        })

        let currentAlertID: string | null = previous?.currentAlertID ?? null

        // 3. There are dangers, were not any prior and then raising one alert of it
        if (inDanger && !wasInDanger){
            const alertRef = await adminDb.collection('alerts').add({
                pendantID,
                type: 'DANGER',
                reasons: evaluation.dangers,
                evidence: {
                    temperature: req.body.temperature ?? null,
                    humidity: req.body.humidity ?? null,
                    pressure: req.body.pressure ?? null,
                    acceleration: req.body.acceleration ?? null,
                },
                status: 'active',
                startedAt: now,
                resolvedAt: null,
                _schemaVersion: 1,
            })
            currentAlertID = alertRef.id
        }

        // 4. If danger ended, resolving the alert automatically
        if (!inDanger && wasInDanger && currentAlertID){
            await adminDb.collection('alerts').doc(currentAlertID).update({
                status:'resolved',
                resolvedAt: now,
            })
            currentAlertID = null
        } 

        //5. Update the pi/pendant's current state.
        // Merge: true means only change this field
        // keeps everything else the same
        await pendantRef.set(
            {
                lastReading: req.body,
                lastPing: now,
                warnings: evaluation.warnings,
                dangerActive: inDanger, // live: true or false every reading
                dangerReasons: evaluation.dangers,
                currentAlertID,
                _schemaVersion: 1,
                // Setting sosActive here since backend determines if sorted out
                ...(req.body.sosPressed === true ? { sosActive: true, sosAt: now } : {}),
            },
            { merge: true},
        )

        // 6. Telling pi/pendant what it will show
        res.status(201).json({ 
            sosActive: req.body.sosPressed === true || previous?.sosActive === true,
            dangerActive: inDanger,
        }) // 201 code here used to send back if pendant is determined to be in danger and if manual help has been addressed
    } catch (err) {
        next(err) //as per boilerplate, errors go to next() and dont res.status(500)
     }
})

export { router as devicesRouter}