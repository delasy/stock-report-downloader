import type { NextFunction, Request, Response } from 'express'

interface CustomRequest extends Request {
  locals: any
}

interface CustomResponse extends Response {
  locals: any
}

type WrapMiddlewareRequestHandler = (
  req: CustomRequest,
  res: CustomResponse,
  next: NextFunction
) => Promise<void> | void

export function wrapMiddleware (fn: WrapMiddlewareRequestHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = fn(req as CustomRequest, res as CustomResponse, next)

    if (result instanceof Promise) {
      result.catch((err) => {
        console.error(err)
        res.send('Internal Server Error')
      })
    }
  }
}
