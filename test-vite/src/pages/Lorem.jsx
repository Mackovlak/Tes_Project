import { LoginForm } from '@/components/login-form'
import { Button } from '@/components/ui/button'
import { HomeIcon } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router'
import { Toaster } from 'sonner'

const Lorem = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10 relative">
      <Link className={'absolute top-1 left-5 font-black text-2xl text-hp-100/50 inline-flex gap-2.5'} to={"/"}>
        <img 
          src="/hp.png" 
          alt="HP Logo" 
          className="w-3/4 max-w-[25px] object-contain " 
        />
        Track 
      </Link>
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm/>
        <Toaster/>
      </div>
    </div>
  )
}

export default Lorem
