import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getRealUserIP, validateIP } from '@/lib/utils/ip-helper';

export async function POST(request) {
  try {
    const { message, session_id, timestamp, source, message_type, audio_data, audio_duration } = await request.json()

    const userIP = getRealUserIP(request);
    const isValidIP = validateIP(userIP); 
    
    if (!isValidIP) {
       console.warn('Invalid IP detected:', userIP);
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

    console.log('Received chat request:', { message, session_id, message_type, audio_duration })
    console.log('User IP resolved to:', userIP)
    console.log('N8N Webhook URL:', process.env.NEXT_PUBLIC_N8N_WEBHOOK)
    
    // Obtener conversación existente de Supabase - AMPLIADO para incluir IP/browser_info
    let sessionData = null
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('conversations, device_id, ip, browser_info')
        .eq('session_id', session_id)
        .single()
      
      if (!error && data) {
        sessionData = data
        console.log('Found existing session with', data.conversations?.length || 0, 'messages')
        
        // ACTUALIZAR IP y browser_info en cada request (para tracking actualizado)
        console.log('Updating session IP and browser info')
        await supabase
          .from('chat_sessions')
          .update({
            ip: userIP,
            browser_info: browserInfo,
            updated_at: new Date().toISOString()
          })
          .eq('session_id', session_id)
        
        // Actualizar sessionData local
        sessionData.ip = userIP
        sessionData.browser_info = browserInfo
      }
    } catch (error) {
      console.log('No existing session found, creating new one')
    }

    // Crear sesión inicial si no existe
    if (!sessionData) {
      console.log('Creating new session for:', session_id)
      const { data: newSession, error: createError } = await supabase
        .from('chat_sessions')
        .upsert({
          session_id: session_id,
          device_id: session_id,
          conversations: [],
          ip: userIP,
          browser_info: browserInfo,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating session:', createError)
      } else {
        console.log('Session created successfully with IP:', userIP)
        sessionData = newSession
      }
    }

    // Construir historial de conversación en texto
    let conversationText = "Historial de conversación:\n\n"
    let userMessages = 0
    let assistantMessages = 0

    if (sessionData && sessionData.conversations && sessionData.conversations.length > 0) {
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

    // Agregar el mensaje actual
    conversationText += `Usuario: ${message}\n\n`
    userMessages += 1

    let n8nResponse
    
    if (message_type === 'voice' && audio_data) {
      console.log('Processing voice message - sending as multipart/form-data')
      
      // Convertir base64 a buffer
      const audioBuffer = Buffer.from(audio_data, 'base64')
      
      // Crear boundary para multipart/form-data manual
      const boundary = `----formdata-claude-${Date.now()}`
      
      // Campos de texto que necesita n8n - ACTUALIZADO con IP real
      const textFields = {
        conversation_text: conversationText,
        current_message: message,
        message_type: message_type,
        audio_duration: audio_duration.toString(),
        session_id: session_id,
        device_id: sessionData?.device_id || session_id,
        language: 'spanish',
        timestamp: timestamp,
        user_ip: userIP, // IP real
        conversation_stats: JSON.stringify({
          total_messages: userMessages + assistantMessages,
          user_messages: userMessages,
          assistant_messages: assistantMessages
        })
      }
      
      // Construir multipart correctamente
      const parts = []
      
      // Agregar cada campo de texto
      for (const [key, value] of Object.entries(textFields)) {
        parts.push(Buffer.from(`--${boundary}\r\n`))
        parts.push(Buffer.from(`Content-Disposition: form-data; name="${key}"\r\n\r\n`))
        parts.push(Buffer.from(`${value}\r\n`))
      }
      
      // Agregar archivo de audio como 'data'
      parts.push(Buffer.from(`--${boundary}\r\n`))
      parts.push(Buffer.from(`Content-Disposition: form-data; name="data"; filename="voice_${Date.now()}.webm"\r\n`))
      parts.push(Buffer.from(`Content-Type: audio/webm\r\n\r\n`))
      parts.push(audioBuffer)
      parts.push(Buffer.from(`\r\n--${boundary}--\r\n`))
      
      // Combinar todos los parts
      const finalBody = Buffer.concat(parts)
      
      console.log('Sending multipart with audio data length:', audioBuffer.length, 'and text fields:', Object.keys(textFields))
      
      // Enviar como multipart/form-data
      n8nResponse = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        },
        body: finalBody
      })
      
    } else {
      console.log('Processing text message - sending as JSON')
      
      // Para mensajes de texto, usar JSON como antes - IP ACTUALIZADA
      const n8nPayload = {
        conversation_text: conversationText,
        current_message: message,
        message_type: message_type || "text",
        session_id: session_id,
        device_id: sessionData?.device_id || session_id,
        language: "spanish",
        timestamp: timestamp,
        user_ip: userIP, // IP real
        conversation_stats: {
          total_messages: userMessages + assistantMessages,
          user_messages: userMessages,
          assistant_messages: assistantMessages
        }
      }

      console.log('Sending to N8N with IP:', userIP)

      n8nResponse = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(n8nPayload)
      })
    }
    
    console.log('N8N Response Status:', n8nResponse.status)
    console.log('N8N Response Headers:', Object.fromEntries(n8nResponse.headers.entries()))
    
    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('N8N Error Response:', errorText)
      console.error('Request was sent to:', process.env.NEXT_PUBLIC_N8N_WEBHOOK)
      throw new Error(`N8N responded with status: ${n8nResponse.status} - ${errorText}`)
    }
    
    // MANEJO ESPECÍFICO DEL FORMATO DE N8N
    let n8nResponseData = null
    let assistantReply = null
    let searchStarted = false
    let conversationTitle = null
    
    try {
      const responseText = await n8nResponse.text()
      console.log('N8N Raw Response Text:', responseText)
      
      if (responseText) {
        try {
          n8nResponseData = JSON.parse(responseText)
          console.log('N8N Parsed JSON:', n8nResponseData)
          
          // TU N8N DEVUELVE: [{ message: "...", started_search: "yes/no", ... }]
          if (Array.isArray(n8nResponseData) && n8nResponseData.length > 0) {
            const responseObj = n8nResponseData[0]
            console.log('Processing response object:', responseObj)
            
            if (responseObj) {
              // Extraer campos específicos
              assistantReply = responseObj.message
              searchStarted = responseObj.started_search === "yes"
              conversationTitle = responseObj.conversation_title
              
              console.log('Extracted data:', {
                message: assistantReply,
                searchStarted,
                conversationTitle
              })
            }
          }
          // Fallback por si cambia el formato  
          else if (n8nResponseData && typeof n8nResponseData === 'object') {
            assistantReply = n8nResponseData.message || 
                            n8nResponseData.reply || 
                            n8nResponseData.response
            searchStarted = n8nResponseData.started_search === "yes"
            conversationTitle = n8nResponseData.conversation_title
          }
          else if (typeof n8nResponseData === 'string') {
            assistantReply = n8nResponseData
          }
          
        } catch (jsonError) {
          console.log('N8N response is not JSON, treating as text:', responseText)
          assistantReply = responseText
        }
      }
    } catch (textError) {
      console.error('Error reading N8N response:', textError)
    }
    
    // Actualizar título de conversación si está disponible
    if (conversationTitle && session_id) {
      try {
        await supabase
          .from('chat_sessions')
          .update({ 
            conversation_title: conversationTitle,
            topic: n8nResponseData[0]?.topic
          })
          .eq('session_id', session_id)
      } catch (error) {
        console.log('Error updating conversation title:', error)
      }
    }
    
    console.log('Final API response will be:', {
      assistant_reply: assistantReply,
      search_started: searchStarted,
      conversation_title: conversationTitle
    })
    
    return NextResponse.json({
      success: true,
      message: 'Message processed successfully',
      assistant_reply: assistantReply,
      search_started: searchStarted,
      conversation_title: conversationTitle,
      n8n_response_received: !!n8nResponseData,
      session_ip: userIP // Para debug
    })
    
  } catch (error) {
    console.error('Chat API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      assistant_reply: "Lo siento, hubo un problema procesando tu mensaje. ¿Puedes intentarlo de nuevo?"
    }, { status: 200 })
  }
}
