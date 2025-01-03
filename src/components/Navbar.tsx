'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import UserAccountnav from './UserAccountnav'
import { useSession,signOut } from 'next-auth/react'
import { CiLogout } from "react-icons/ci";


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, status } = useSession()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Se não houver sessão ou a sessão estiver carregando, não renderiza a Navbar
  if (status === 'loading' || !session) return null

  return (
    <nav className="bg-white shadow-md w-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center w-full">
            <Link href="/" className="flex-shrink-0">
              <p className="text-3xl font-bold text-gray-800 hover:text-blue-500 transition duration-300">
                Protótipo
              </p>
            </Link>

            <div className="hidden md:block flex-grow flex flex-row">
              <div className='flex flex-row items-center'>
                <div className="ml-40 flex items-baseline space-x-4">
                  <div className="flex justify-around min-w-[500px] items-baseline space-x-4">
                    <Link href="/" className="text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">
                      Início
                    </Link>
                    <Link href="/form" className="text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">
                      Produtos
                    </Link>
                    <Link href="/servicos" className="text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">
                      Serviços
                    </Link>
                    <Link href="/contato" className="text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">
                      Contato
                    </Link>
                  </div>
                </div>
                <div className="ml-auto ">
                  <UserAccountnav />
                </div>
              </div>
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Abrir menu principal</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="text-gray-800 hover:bg-gray-200 block px-3 py-2 rounded-md text-base font-medium">
              Início
            </Link>
            <Link href="/sobre" className="text-gray-800 hover:bg-gray-200 block px-3 py-2 rounded-md text-base font-medium">
              Sobre
            </Link>
            <Link href="/servicos" className="text-gray-800 hover:bg-gray-200 block px-3 py-2 rounded-md text-base font-medium">
              Serviços
            </Link>
            <Link href="/contato" className="text-gray-800 hover:bg-gray-200 block px-3 py-2 rounded-md text-base font-medium">
              Contato
            </Link>
          </div>
          <div
           onClick={() => signOut({
            redirect: true,
            callbackUrl: `${window.location.origin}/sign-in`
        })}
           className='ml-4 mb-4 cursor-pointer flex flex-row items-center justify-center gap-2 bg-black rounded-md max-w-[120px] text-white p-2'>
            <p>LogOut</p> 
            <span>
              <CiLogout className='h-5 w-5'/>
            </span>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
