import React from 'react'
import { TabsService } from './components/service-case'
import { ServiceWork } from './components/service-work'

export const Work = () => {
  return (
    <div>
        <TabsService></TabsService>
        <ServiceWork></ServiceWork>
    </div>
  )
}
