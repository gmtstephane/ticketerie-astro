import { z } from 'zod';

export const ticketSchema = z.object({
	ticketingId: z.number(),
	price: z.string(),
	url: z.string(),
});

export const createEventTeamSchema = z.object({
	sport: z.number(),
	championship: z.number(),
	location: z.number(),
	homeTeam: z.number(),
	awayTeam: z.number(),
	date: z.date(),
	tickets: z.array(ticketSchema),
});

export const createEventPlayerSchema = z.object({
	sport: z.number(),
	championship: z.number(),
	location: z.number(),
	player1: z.number(),
	player2: z.number(),
	date: z.date(),
	tickets: z.array(ticketSchema),
});