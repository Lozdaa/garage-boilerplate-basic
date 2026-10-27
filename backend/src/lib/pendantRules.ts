import { read } from 'fs'
import thresholds from '../config/alert_thresholds.json'

// Reading model taken from device output, all the sensors
export interface Reading {
    temperature?: number
    humidity?: number
    pressure?: number
    acceleration?: {x: number; y: number; z: number}
    orientation?: {pitch: number; roll: number; yaw: number}
}

// Evaluation is for the danger status
export interface Evaluation {
    dangers: string[]
    warnings: string[]
}

// The readings range
interface Range {
    min: number
    max: number
}

// Holds the limits
interface Limits {
    warning: Range
    danger: Range
}

// Here the range checks are being done like in devices
function outOfRange(value: number | undefined, range: Range): boolean {
    return value !== undefined && (value < range.min || value > range.max)
}

export function evaluateReadings(reading: Reading): Evaluation {
    const warnings: string[] = []
    const dangers: string[] = []

    // Checking danger of the reading
    function check(name: string, value: number | undefined, limits: Limits){
        if (outOfRange(value, limits.danger)){
            dangers.push(name)
        } else if (outOfRange(value, limits.warning)){
            warnings.push(name)
        }
    }

    check('TEMPERATURE', reading.temperature, thresholds.temperature)
    check('HUMIDITY', reading.humidity, thresholds.humidity)
    check('PRESSURE', reading.pressure, thresholds.pressure)

    if (
        outOfRange(reading.orientation?.pitch, thresholds.orientation.pitch)
        ||
        outOfRange(reading.orientation?.roll, thresholds.orientation.roll)
    )
    {
        warnings.push('TILTED')
    }

    if (reading.acceleration !== undefined && reading.acceleration.z < thresholds.turnedOver.accelerationZBelow){
        dangers.push('TURNED_OVER')
    }

    return { dangers, warnings }
}