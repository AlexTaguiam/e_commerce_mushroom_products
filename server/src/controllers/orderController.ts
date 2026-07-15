import { Request, Response } from "express";
import prisma from "../config/db";

export const createOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  //   const { uid } = req.user?.uid;
};

export const getOrderById = async (
  req: Request,
  res: Response,
): Promise<void> => {};

export const confirmOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {};

export const updateOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {};

export const cancelOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {};
