import { Client } from '@stomp/stompjs'
import type { IMessage } from '@stomp/stompjs'
import { useEffect, useMemo, useState } from 'react'
import type { NotificationItem } from '../types/models'

const FALLBACK_MESSAGES = [
  'Live session SES-2403 reached 80% check-ins.',
  'New anomaly detected in Room 402.',
  'Beacon A105 heartbeat timeout warning.',
  'Daily attendance summary is ready for export.',
]

export function useRealtimeNotifications(initial: NotificationItem[]) {
  const [items, setItems] = useState<NotificationItem[]>(initial)

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL

    if (wsUrl) {
      const client = new Client({
        brokerURL: wsUrl,
        reconnectDelay: 5000,
      })

      client.onConnect = () => {
        client.subscribe('/topic/admin/notifications', (message: IMessage) => {
          const text = message.body || 'New real-time notification'
          setItems((prev) => [
            {
              id: crypto.randomUUID(),
              text,
              time: 'just now',
              unread: true,
            },
            ...prev,
          ])
        })
      }

      client.activate()
      return () => client.deactivate()
    }

    const timer = window.setInterval(() => {
      const randomMessage =
        FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)]
      setItems((prev) => [
        {
          id: crypto.randomUUID(),
          text: randomMessage,
          time: 'just now',
          unread: true,
        },
        ...prev.slice(0, 5),
      ])
    }, 24000)

    return () => window.clearInterval(timer)
  }, [])

  const unreadCount = useMemo(
    () => items.filter((item) => item.unread).length,
    [items],
  )

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })))
  }

  return { items, unreadCount, markAllRead }
}
