import { z } from "zod";

const blankToUndefined = (value: unknown) => (value === "" || value === null ? undefined : value);

export const optionalText = (max: number) =>
  z.preprocess(blankToUndefined, z.string().trim().max(max).optional());

export const optionalId = z.preprocess(blankToUndefined, z.coerce.number().int().positive().optional());

export const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(blankToUndefined, z.enum(values).optional());

export const PlaceFields = z.object({
  roomId: optionalId,
  spotId: optionalId,
  newSpot: optionalText(60),
  containerId: optionalId,
});
