import Joi from 'joi';
export interface ICardInteraction { cardId: number; round: number; isCorrect: boolean; }
export interface ICreateSessionDto { deckId: number; durationMs: number; interactions: ICardInteraction[]; }
export const cardInteractionSchema = Joi.object<ICardInteraction>({ cardId: Joi.number().integer().positive().required(), round: Joi.number().integer().min(1).required(), isCorrect: Joi.boolean().required(), });
export const createSessionSchema = Joi.object<ICreateSessionDto>({ deckId: Joi.number().integer().positive().required(), durationMs: Joi.number().integer().min(1).required(), interactions: Joi.array().items(cardInteractionSchema).min(1).required(), });