'use client'
import { MessageCircle, Search, Heart, MapPin } from 'lucide-react'

export default function BottomNavigation({ activeTab, onTabChange, savedCount = 0, hasUnvisitedSaves = false }) {
  const tabs = [
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'explore', icon: Search, label: 'Explorar' },
    { id: 'saved', icon: Heart, label: 'Guardados' },
    { id: 'nearby', icon: MapPin, label: 'Cerca de ti' },
  ]

  const getBubbleStyle = (isActive, hasUnvisited) => {
    if (hasUnvisited) {
      // Hay propiedades pendientes de visitar
      return {
        backgroundColor: isActive ? '#0A0A23' : '#D8D8E0',
        color: '#FFFFFF',
        border: 'none'
      }
    } else {
      // Ya visitó todas las propiedades
      return {
        backgroundColor: 'transparent',
        color: isActive ? '#0A0A23' : '#D8D8E0',
        border: `1px solid ${isActive ? '#0A0A23' : '#D8D8E0'}`
      }
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative flex flex-col items-center p-2 rounded-lg transition-colors"
          >
            <tab.icon 
              size={24} 
              className={
                activeTab === tab.id 
                  ? 'text-[#0A0A23] fill-[#0A0A23]' 
                  : 'text-[#D8D8E0]'
              }
              fill={activeTab === tab.id ? '#0A0A23' : 'none'}
              strokeWidth={2}
            />
            <span 
              className={`text-xs mt-1 font-medium ${
                activeTab === tab.id 
                  ? 'text-[#0A0A23]' 
                  : 'text-[#D8D8E0]'
              }`}
            >
              {tab.label}
            </span>
            
            {tab.id === 'saved' && savedCount > 0 && (
              <div 
                className="absolute -top-0.5 -right-0.5 min-w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  ...getBubbleStyle(activeTab === 'saved', hasUnvisitedSaves),
                  fontSize: '10px'
                }}
              >
                {savedCount}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
