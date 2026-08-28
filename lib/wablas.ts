export async function sendWhatsAppMessage(phone: string | null | undefined, message: string) {
  if (!phone) {
    console.log('Skipping WhatsApp message: Phone number is null or empty.')
    return { success: false, error: 'No phone number provided' }
  }
  
  // Format phone number to start with 62 instead of 0
  let formattedPhone = phone.trim()
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '62' + formattedPhone.substring(1)
  }

  const link = "https://jkt.wablas.com/api/send-message"
  const token = process.env.WABLAS_TOKEN

  if (!token) {
    console.error('Missing WABLAS_TOKEN environment variable')
    return { success: false, error: 'Server configuration missing: WABLAS_TOKEN' }
  }

  const formData = new URLSearchParams()
  formData.append('phone', formattedPhone)
  formData.append('message', message)

  try {
    const response = await fetch(link, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    })

    const resultText = await response.text()
    
    if (!response.ok) {
      console.error('Wablas API Error:', response.status, resultText)
      return { success: false, error: `API responded with ${response.status}: ${resultText}` }
    }

    return { success: true, result: resultText }
  } catch (error: any) {
    console.error('Error sending WhatsApp message via Wablas:', error)
    return { success: false, error: error.message || 'Unknown error' }
  }
}
