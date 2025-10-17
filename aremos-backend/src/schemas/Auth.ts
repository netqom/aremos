import Joi from 'joi';
export interface IRegisterDto { name: string; password: string; code: string; }
export interface ILoginDto { name: string; password: string; code: string; }
export const registerSchema = Joi.object<IRegisterDto>({
  name: Joi.string().min(3).max(100).required(),
  password: Joi.string().min(6).max(256).required(),
  code: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
});
export const loginSchema = Joi.object<ILoginDto>({
  name: Joi.string().min(3).max(100).required(),
  password: Joi.string().min(6).max(256).required(),
  code: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
});