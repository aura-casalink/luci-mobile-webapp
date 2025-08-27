'use client'
import { MessageCircle, Search, Heart, MapPin } from 'lucide-react'

export default function TopNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'explore', icon: Search, label: 'Explorar' },
    { id: 'saved', icon: Heart, label: 'Guardados' },
    { id: 'nearby', icon: MapPin, label: 'Cerca de ti' },
  ]

  return (
    <div className="fixed top-4 left-4 right-4 z-40 flex justify-center">
      <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 p-1">
        {tabs.slice(0, 3).map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange && onTabChange(tab.id)}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-gray-900 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon size={16} className="mr-2" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
