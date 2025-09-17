import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getRealUserIP, validateIP } from '@/lib/utils/ip-helper'

export async function POST(request) {
  console.log('===== CHAT API START =====')
  
  try {
    const body = await request.json()
    const { message, session_id, timestamp, source, message_type, audio_data, audio_duration } = body

    // DEBUG: Log completo de entrada
    console.log('1. Request received:', {
      message: message?.substring(0, 100) + '...',
      session_id,
      message_type,
      audio_duration,
      hasAudioData: !!audio_data
    })

    const userIP = getRealUserIP(request)
    const isValidIP = validateIP(userIP)
    
    if (!isValidIP) {
       console.warn('2. Invalid IP detected:', userIP)
    } else {
       console.log('2. User IP resolved:', userIP)
    }

    // Verificar webhook URL
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK
    console.log('3. N8N Webhook URL:', webhookUrl || 'NOT CONFIGURED!')
    
    if (!webhookUrl) {
      console.error('❌ N8N_WEBHOOK not configured in environment variables!')
      return NextResponse.json({
        success: false,
        assistant_reply: "Lo siento, el servicio no está configurado correctamente. Por favor contacta al administrador.",
        search_started: false,
        error: "N8N webhook URL not configured"
      }, { status: 200 })
    }

    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referer = request.headers.get('referer') || request.headers.get('referrer') || null

    const browserInfo = {
      userAgent: userAgent,
      timestamp: new Date().toISOString(),
      referrer: referer,
      language: request.headers.get('accept-language') || null,
      host: request.headers.get('host') || null
    }

    // Obtener conversación existente de Supabase
    let sessionData = null
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('conversations, device_id, ip, browser_info')
        .eq('session_id', session_id)
        .single()
      
      if (!error && data) {
        sessionData = data
        console.log('4. Found existing session with', data.conversations?.length || 0, 'messages')
        
        // Actualizar IP y browser_info
        await supabase
          .from('chat_sessions')
          .update({
            ip: userIP,
            browser_info: browserInfo,
            updated_at: new Date().toISOString()
          })
          .eq('session_id', session_id)
        
        sessionData.ip = userIP
        sessionData.browser_info = browserInfo
      } else {
        console.log('4. No existing session found, will create new one')
      }
    } catch (error) {
      console.log('4. Error fetching session:', error.message)
    }

    // Crear conversación completa
    let conversationText = ""
    let userMessages = 0
    let assistantMessages = 0
    
    if (sessionData?.conversations && sessionData.conversations.length > 0) {
      sessionData.conversations.forEach(msg => {
        const speaker = msg.type === 'user' ? 'Usuario' : 'Luci'
        conversationText += `${speaker}: ${msg.content}\n\n`
        
        if (msg.type === 'user') userMessages++
        else if (msg.type === 'assistant') assistantMessages++
      })
    } else {
      conversationText += "Luci: Hola, soy Luci. ¿Qué vivienda buscas?\n\n"
      assistantMessages = 1
    }

    conversationText += `Usuario: ${message}\n\n`
    userMessages += 1

    console.log('5. Conversation stats:', { userMessages, assistantMessages, totalLength: conversationText.length })

    // Preparar y enviar a n8n
    let n8nResponse = null
    
    try {
      if (message_type === 'voice' && audio_data) {
        console.log('6. Processing voice message - multipart/form-data')
        
        // [MANTENER TU LÓGICA DE VOICE EXISTENTE]
        const audioBuffer = Buffer.from(audio_data, 'base64')
        const boundary = `----formdata-luci-${Date.now()}`
        
        const textFields = {
          conversation_text: conversationText,
          current_message: message,
          message_type: message_type,
          audio_duration: audio_duration?.toString() || '0',
          session_id: session_id,
          device_id: sessionData?.device_id || session_id,
          language: 'spanish',
          timestamp: timestamp || new Date().toISOString(),
          user_ip: userIP,
          conversation_stats: JSON.stringify({
            total_messages: userMessages + assistantMessages,
            user_messages: userMessages,
            assistant_messages: assistantMessages
          })
        }
        
        const parts = []
        for (const [key, value] of Object.entries(textFields)) {
          parts.push(Buffer.from(`--${boundary}\r\n`))
          parts.push(Buffer.from(`Content-Disposition: form-data; name="${key}"\r\n\r\n`))
          parts.push(Buffer.from(`${value}\r\n`))
        }
        
        parts.push(Buffer.from(`--${boundary}\r\n`))
        parts.push(Buffer.from(`Content-Disposition: form-data; name="data"; filename="voice_${Date.now()}.webm"\r\n`))
        parts.push(Buffer.from(`Content-Type: audio/webm\r\n\r\n`))
        parts.push(audioBuffer)
        parts.push(Buffer.from(`\r\n--${boundary}--\r\n`))
        
        const finalBody = Buffer.concat(parts)
        
        n8nResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`
          },
          body: finalBody
        })
        
      } else {
        console.log('6. Processing text message - JSON')
        
        const n8nPayload = {
          conversation_text: conversationText,
          current_message: message,
          message_type: message_type || "text",
          session_id: session_id,
          device_id: sessionData?.device_id || session_id,
          language: "spanish",
          timestamp: timestamp || new Date().toISOString(),
          user_ip: userIP,
          conversation_stats: {
            total_messages: userMessages + assistantMessages,
            user_messages: userMessages,
            assistant_messages: assistantMessages
          }
        }

        console.log('7. Sending to N8N:', {
          url: webhookUrl,
          payloadKeys: Object.keys(n8nPayload),
          ip: userIP
        })

        n8nResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(n8nPayload)
        })
      }
      
      console.log('8. N8N Response Status:', n8nResponse.status)
      console.log('9. N8N Response OK:', n8nResponse.ok)
      
    } catch (fetchError) {
      console.error('❌ Error calling n8n:', fetchError)
      console.error('Error details:', {
        message: fetchError.message,
        stack: fetchError.stack,
        url: webhookUrl
      })
      
      // Fallback cuando n8n no está disponible
      return NextResponse.json({
        success: false,
        assistant_reply: "Lo siento, el servicio está temporalmente no disponible. Por favor intenta de nuevo en unos momentos.",
        search_started: false,
        error: `N8N connection failed: ${fetchError.message}`
      }, { status: 200 })
    }

    // Procesar respuesta de n8n
    let assistantReply = null
    let searchStarted = false
    let conversationTitle = null
    
    if (n8nResponse) {
      try {
        const responseText = await n8nResponse.text()
        console.log('10. N8N Raw Response (first 500 chars):', responseText.substring(0, 500))
        
        if (!n8nResponse.ok) {
          console.error('❌ N8N returned error status:', n8nResponse.status, responseText)
          throw new Error(`N8N error: ${n8nResponse.status}`)
        }
        
        if (responseText) {
          try {
            const n8nResponseData = JSON.parse(responseText)
            console.log('11. N8N Parsed Response:', JSON.stringify(n8nResponseData))
            
            // Tu n8n devuelve un array con un objeto
            if (Array.isArray(n8nResponseData) && n8nResponseData.length > 0) {
              const responseObj = n8nResponseData[0]
              
              assistantReply = responseObj.message || responseObj.reply || responseObj.response
              searchStarted = responseObj.started_search === "yes"
              conversationTitle = responseObj.conversation_title
              
              console.log('12. Extracted from n8n:', {
                hasReply: !!assistantReply,
                searchStarted,
                hasTitle: !!conversationTitle
              })
            }
            // Fallback para otros formatos
            else if (n8nResponseData && typeof n8nResponseData === 'object') {
              assistantReply = n8nResponseData.message || 
                              n8nResponseData.reply || 
                              n8nResponseData.response ||
                              n8nResponseData.assistant_reply
              searchStarted = n8nResponseData.started_search === "yes" || n8nResponseData.search_started === true
              conversationTitle = n8nResponseData.conversation_title
            }
            
          } catch (jsonError) {
            console.log('⚠️ N8N response is not JSON, using as plain text')
            assistantReply = responseText
          }
        }
      } catch (error) {
        console.error('❌ Error processing n8n response:', error)
      }
    }

    // Validar y establecer valores por defecto
    if (!assistantReply) {
      console.warn('⚠️ No assistant reply from n8n, using fallback')
      assistantReply = "Perdona, no he podido procesar tu mensaje correctamente. ¿Podrías reformularlo?"
    }

    // Actualizar título de conversación si está disponible
    if (conversationTitle && session_id) {
      try {
        await supabase
          .from('chat_sessions')
          .update({ 
            conversation_title: conversationTitle,
            updated_at: new Date().toISOString()
          })
          .eq('session_id', session_id)
        console.log('13. Conversation title updated')
      } catch (error) {
        console.log('⚠️ Error updating conversation title:', error.message)
      }
    }
    
    const finalResponse = {
      success: true,
      message: 'Message processed successfully',
      assistant_reply: assistantReply,
      search_started: searchStarted,
      conversation_title: conversationTitle,
      n8n_response_received: true,
      session_ip: userIP
    }
    
    console.log('14. Final API response:', {
      success: finalResponse.success,
      hasAssistantReply: !!finalResponse.assistant_reply,
      replyLength: finalResponse.assistant_reply?.length,
      searchStarted: finalResponse.search_started
    })
    
    console.log('===== CHAT API SUCCESS =====')
    return NextResponse.json(finalResponse)
    
  } catch (error) {
    console.error('===== CHAT API ERROR =====')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('===== END ERROR =====')
    
    return NextResponse.json({
      success: false,
      error: error.message,
      assistant_reply: "Lo siento, hubo un problema procesando tu mensaje. ¿Puedes intentarlo de nuevo?",
      search_started: false
    }, { status: 200 })
  }
}