import Joi from 'joi';
export interface ICreateDeckDto { name?: string; }
export interface IUpdateDeckNameDto { name: string; }
export interface ICreateCardDto { question: string; answer: string; questionImageUrl?: string | null; answerImageUrl?: string | null; }
export interface IUpdateCardDto { question?: string; answer?: string; questionImageUrl?: string | null; answerImageUrl?: string | null; }
export const createDeckSchema = Joi.object<ICreateDeckDto>({ name: Joi.string().min(3).max(100).optional() });
export const updateDeckNameSchema = Joi.object<IUpdateDeckNameDto>({ name: Joi.string().min(3).max(100).required() });
export const createCardSchema = Joi.object<ICreateCardDto>({
  question: Joi.string().min(1).max(1000).required(),
  answer: Joi.string().min(1).max(1000).required(),
  questionImageUrl: Joi.string().uri().optional().allow(null, ''),
  answerImageUrl: Joi.string().uri().optional().allow(null, ''),
});
export const updateCardSchema = Joi.object<IUpdateCardDto>({
  question: Joi.string().min(1).max(1000).optional(),
  answer: Joi.string().min(1).max(1000).optional(),
  questionImageUrl: Joi.string().uri().optional().allow(null, ''),
  answerImageUrl: Joi.string().uri().optional().allow(null, ''),
});

export interface IUpdateAliasNameDto { name: string; }
export const updateAliasNameSchema = Joi.object<IUpdateAliasNameDto>({
  name: Joi.string().min(3).max(100).required(),
});
