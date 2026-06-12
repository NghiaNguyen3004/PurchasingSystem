import 'dotenv/config'

const WEBHOOK_URL ={ //Adding your webhook URL into .env file, then it will appear here.
    "request.approved": process.env.WEBHOOK_APPROVED,
}

export function sendWebhook(event, payload) {
    const url = WEBHOOK_URL[event]
    if (!url) {
        console.warn(`No webhook URL configured for event: ${event}`)
        return
    }
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            event,
            ...payload,
            timestamp: new Date().toISOString(),
        })
    }).catch(err => console.error(`Webhook failed for event ${event}:`, err.message))
}