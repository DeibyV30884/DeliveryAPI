function traducirManiobra(maniobra, nombreCalle) {
    const { type, modifier } = maniobra
    const calle = nombreCalle ? ` en ${nombreCalle}` : ''

    const modificadores = {
        left: 'a la izquierda',
        right: 'a la derecha',
        'sharp left': 'bruscamente a la izquierda',
        'sharp right': 'bruscamente a la derecha',
        'slight left': 'levemente a la izquierda',
        'slight right': 'levemente a la derecha',
        straight: 'recto',
        uturn: 'en U',
    }

    switch (type) {
        case 'depart':
            return `Sal${calle}`
        case 'arrive':
            return 'Has llegado a tu destino'
        case 'turn':
            return `Gira ${modificadores[modifier] || ''}${calle}`
        case 'new name':
            return `Continúa${calle}`
        case 'merge':
            return `Incorpórate${calle}`
        case 'fork':
            return `Toma el desvío ${modificadores[modifier] || ''}${calle}`
        case 'roundabout':
        case 'rotary':
            return `Toma la rotonda${calle}`
        case 'continue':
            return `Sigue ${modificadores[modifier] || 'recto'}${calle}`
        default:
            return `Continúa${calle}`
    }
}

function formatoDistancia(metros) {
    if (metros >= 1000) return (metros / 1000).toFixed(1) + ' km'
    return Math.round(metros) + ' m'
}

// Pide a OSRM la ruta real entre dos puntos [lat,lng], con pasos de navegación.
// OSRM espera lng,lat al revés de Leaflet.
export async function obtenerRutaConPasos(origen, destino) {
    try {
        const origenTexto = origen[1] + ',' + origen[0]
        const destinoTexto = destino[1] + ',' + destino[0]
        const coords = origenTexto + ';' + destinoTexto

        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=true`

        const respuesta = await fetch(url)
        if (!respuesta.ok) return { puntos: null, pasos: [] }

        const data = await respuesta.json()
        if (!data.routes || !data.routes[0]) return { puntos: null, pasos: [] }

        const ruta = data.routes[0]
        const puntos = ruta.geometry.coordinates.map((punto) => [punto[1], punto[0]])

        const pasos = []
        for (const leg of ruta.legs) {
            for (const paso of leg.steps) {
                pasos.push({
                    instruccion: traducirManiobra(paso.maneuver, paso.name),
                    distancia: formatoDistancia(paso.distance),
                })
            }
        }

        return { puntos, pasos }
    } catch {
        return { puntos: null, pasos: [] }
    }
}

function distanciaEntrePuntos(puntoA, puntoB) {
    const difLat = puntoB[0] - puntoA[0]
    const difLng = puntoB[1] - puntoA[1]
    return Math.sqrt(difLat * difLat + difLng * difLng)
}

// Dada la ruta (array de [lat,lng]) y una fracción 0-1, da el punto que le corresponde
export function obtenerPuntoEnRuta(ruta, fraccion) {
    if (!ruta || ruta.length === 0) return null
    if (ruta.length === 1) return ruta[0]

    let distanciaTotal = 0
    for (let i = 0; i < ruta.length - 1; i++) {
        distanciaTotal += distanciaEntrePuntos(ruta[i], ruta[i + 1])
    }

    const distanciaObjetivo = distanciaTotal * fraccion
    let distanciaAcumulada = 0

    for (let i = 0; i < ruta.length - 1; i++) {
        const puntoInicio = ruta[i]
        const puntoFin = ruta[i + 1]
        const distanciaTramo = distanciaEntrePuntos(puntoInicio, puntoFin)

        if (distanciaAcumulada + distanciaTramo >= distanciaObjetivo) {
            let fraccionDelTramo = 0
            if (distanciaTramo > 0) {
                fraccionDelTramo = (distanciaObjetivo - distanciaAcumulada) / distanciaTramo
            }
            const lat = puntoInicio[0] + fraccionDelTramo * (puntoFin[0] - puntoInicio[0])
            const lng = puntoInicio[1] + fraccionDelTramo * (puntoFin[1] - puntoInicio[1])
            return [lat, lng]
        }
        distanciaAcumulada += distanciaTramo
    }

    return ruta[ruta.length - 1]
}