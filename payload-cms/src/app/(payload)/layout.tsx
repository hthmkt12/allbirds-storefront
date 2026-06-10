import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import React from 'react'
import configPromise from '../../payload.config'
import { importMap } from './admin/importMap'

type Args = {
  children: React.ReactNode
}

const Layout = ({ children }: Args) =>
  RootLayout({
    children,
    config: configPromise,
    importMap,
    serverFunction: async (args) => {
      'use server'
      return handleServerFunctions({
        ...args,
        config: configPromise,
        importMap,
      })
    },
  })

export default Layout
