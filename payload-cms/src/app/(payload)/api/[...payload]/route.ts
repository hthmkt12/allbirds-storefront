import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST, REST_PUT } from '@payloadcms/next/routes'
import configPromise from '../../../../payload.config'

type RouteContext = {
  params: Promise<{
    payload: string[]
  }>
}

export const GET = (request: Request, context: RouteContext) => {
  return REST_GET(configPromise)(request, {
    params: context.params.then((p) => ({ slug: p.payload })),
  })
}

export const POST = (request: Request, context: RouteContext) => {
  return REST_POST(configPromise)(request, {
    params: context.params.then((p) => ({ slug: p.payload })),
  })
}

export const PUT = (request: Request, context: RouteContext) => {
  return REST_PUT(configPromise)(request, {
    params: context.params.then((p) => ({ slug: p.payload })),
  })
}

export const DELETE = (request: Request, context: RouteContext) => {
  return REST_DELETE(configPromise)(request, {
    params: context.params.then((p) => ({ slug: p.payload })),
  })
}

export const PATCH = (request: Request, context: RouteContext) => {
  return REST_PATCH(configPromise)(request, {
    params: context.params.then((p) => ({ slug: p.payload })),
  })
}

export const OPTIONS = (request: Request, context: RouteContext) => {
  return REST_OPTIONS(configPromise)(request, {
    params: context.params.then((p) => ({ slug: p.payload })),
  })
}
