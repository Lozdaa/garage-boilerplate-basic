import { Router, type Router as ExpressRouter } from 'express'
import { adminDb } from '../lib/firebase'

const router: ExpressRouter = Router()

// This is route
// POST /api/devices/:deviceId/readings

router.post('/:deviceID/readings', async (req, res, next) => {
    try {
        const pendantID = req.params.deviceID
        const pendantRef = adminDb.collection('pendants').doc(pendantID) // the route so for example: pendants/pi-01
        const now = new Date()

        // 1. Logging the pi/pendant's reading
        await adminDb.collection('readings').add({
            ...req.body, // this is all data that the pi sends out
            pendantID,
            receivedAt: now,
            _schemaVersion: 1,
        })

        //2. Update the pi/pendant's current state.
        // Merge: true means only change this field
        // keeps everything else the same
        await pendantRef.set(
            {
                lastReading: req.body,
                lastPing: now,
                _schemaVersion: 1,
                // Setting sosActive here since backend determines if sorted out
                ...(req.body.sosPressed === true ? { sosActive: true, sosAt: now } : {}),
            },
            { merge: true},
        )

        // 3. Reading the state back to pi/pendant and telling it what to show
        const pendant = (await pendantRef.get()).data()
        res.status(201).json({ 
            sosActive: pendant?.sosActive === true,
            dangerActive: false, // adding this later when we make rules
        }) // 201 code here used to send back if pendant is determined to be in danger and if manual help has been addressed
    } catch (err) {
        next(err) //as per boilerplate, errors go to next() and dont res.status(500)
     }
})

export { router as devicesRouter}