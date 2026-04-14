import React, { useEffect } from 'react'
import { AppProvider, useApp } from './contexts/AppContext.jsx'
import Topbar from './components/Topbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import Canvas from './components/Canvas.jsx'
import ConfigPanel from './components/ConfigPanel.jsx'
import YamlPreview from './components/YamlPreview.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import ValidationOverlay from './components/ValidationOverlay.jsx'
import MobileNav from './components/MobileNav.jsx'
import MobileStepPickerSheet from './components/MobileStepPickerSheet.jsx'
import Tooltip from './components/Tooltip.jsx'

function AppInner() {
  const { state } = useApp()

  useEffect(() => {
    document.body.className = state.theme
  }, [state.theme])

  return (
    <div className={'app' + (state.mobileTab === 'yaml' ? ' yaml-tab-active' : '')}>
      <Topbar />
      <div className="main">
        <ValidationOverlay />
        <Sidebar />
        <Canvas />
        <ConfigPanel />
        <SettingsPanel />
      </div>
      <YamlPreview />
      <MobileNav />
      <MobileStepPickerSheet />
      <Tooltip />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
