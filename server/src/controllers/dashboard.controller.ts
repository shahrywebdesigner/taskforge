
import type { Request, Response } from 'express'
import { getDashboardData } from '../services/dashboard.service.js'

export const getDashboardController = async (
  req: Request,
  res: Response
) => {
  const data = await getDashboardData(req.user!._id.toString())

  res.status(200).json({
    success: true,
    data,
  })
}
