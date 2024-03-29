import type { CreateTicket } from '@db/types';
import moment from 'moment-timezone';
import { db } from '@db/config';

import { eventPlayer, ticket, eventType } from '@db/schema';
import { createEventPlayerSchema } from './schemas';
import { eq } from 'drizzle-orm';
import { UpdateTickets } from './update';

export async function CreateEventPlayer(data: FormData): Promise<Response> {
	try {
		const tickets: CreateTicket[] = JSON.parse(data.get('tickets')?.toString() || '[]');
		const createEventForm = createEventPlayerSchema.parse({
			sport: Number(data.get('sport')),
			location: Number(data.get('location')),
			championship: Number(data.get('championship')),
			player1: Number(data.get('player1')),
			player2: Number(data.get('player2')),
			date: moment.tz(data.get('date')?.toString(), 'Europe/Paris').toDate(),
		});

		const event = await db.transaction(async (tx) => {
			const event = await tx
				.insert(eventPlayer)
				.values({
					championshipId: createEventForm.championship,
					locationId: createEventForm.location,
					sportId: createEventForm.sport,
					eventDate: createEventForm.date,
					player1: createEventForm.player1,
					player2: createEventForm.player2,
				})
				.returning();

			if (event.length === 0) {
				tx.rollback();
				throw new Error('Failed to create event');
			}

			await tx.insert(eventType).values({
				eventid: event[0].id,
				type: 'Individual',
			});

			tickets.map(async (t) => {
				await tx.insert(ticket).values({
					price: t.price,
					eventId: event[0].id,
					ticketingId: t.ticketingId,
					url: t.url,
				});
			});
			return event[0];
		});

		return new Response(null, { status: 303, headers: { Location: '/events/' + event.id + '?create=true' } });
	} catch (error) {
		return new Response(JSON.stringify(error), { status: 500 });
	}
}

export async function UpdateEventPlayer(data: FormData, id: string) {
	try {
		const tickets: CreateTicket[] = JSON.parse(data.get('tickets')?.toString() || '[]');
		const createEventForm = createEventPlayerSchema.parse({
			sport: Number(data.get('sport')),
			location: Number(data.get('location')),
			championship: Number(data.get('championship')),
			player1: Number(data.get('player1')),
			player2: Number(data.get('player2')),
			date: moment.tz(data.get('date')?.toString(), 'Europe/Paris').toDate(),
		});

		const event = await db.transaction(async (tx) => {
			const event = await tx
				.update(eventPlayer)
				.set({
					championshipId: createEventForm.championship,
					locationId: createEventForm.location,
					sportId: createEventForm.sport,
					eventDate: createEventForm.date,
					player1: createEventForm.player1,
					player2: createEventForm.player2,
					updatedAt: new Date(),
				})
				.where(eq(eventPlayer.id, id))
				.returning();

			if (event.length === 0) {
				throw new Error('Failed to update event');
			}

			await UpdateTickets(tickets, id, { withTx: tx });

			return event[0];
		});

		return new Response(null, { status: 303, headers: { Location: '/events/' + event.id + '?update=true' } });
	} catch (error) {
		return new Response(JSON.stringify(error), { status: 500 });
	}
}
