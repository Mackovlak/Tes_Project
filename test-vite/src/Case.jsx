import React from 'react'
import { TabsService } from './components/service-case'
import { ServiceCase } from './components/service-case'

export const Case = () => {
  return (   
    <div>
      <TabsService></TabsService>
      <ServiceCase></ServiceCase>
    </div>
  )
}
