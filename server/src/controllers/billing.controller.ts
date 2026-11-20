import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

import {
  createCheckoutSession,
  getPaymentStatus,
} from "../services/billing.service.js";
import AppError from "../utils/AppError.js";

const checkoutSchema = z.object({
  plan: z.enum(["monthly", "yearly"]),
});

export const createCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authRequest = req as Request & {
      user?: {
        _id: { toString(): string };
      };
    };

    const userId = authRequest.user?._id.toString();

    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    const validation = checkoutSchema.safeParse(req.body);

    if (!validation.success) {
      throw new AppError("Please select a valid subscription plan", 400);
    }

    const checkout = await createCheckoutSession(userId, validation.data.plan);

    res.status(200).json({
      success: true,
      message: "Checkout session created successfully",
      data: checkout,
    });
  } catch (error) {
    next(error);
  }
};

export const checkPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authRequest = req as Request & {
      user?: {
        _id: { toString(): string };
      };
    };

    const userId = authRequest.user?._id.toString();

    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    const sessionId = req.params.sessionId;

    if (typeof sessionId !== "string") {
      throw new AppError("Invalid session ID", 400);
    }

    const payment = await getPaymentStatus(userId, sessionId);

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};
