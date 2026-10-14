import { DurableObject } from "cloudflare:workers";

export const STAT_EVENTS = ["visit", "short_created", "short_opened", "gallery_opened"] as const;

export type StatEvent = (typeof STAT_EVENTS)[number];

export type DayCount = { readonly day: string; readonly event: StatEvent; readonly count: number };

export type TopPrompt = { readonly slug: string; readonly count: number };

export type StatsSnapshot = {
	readonly totals: Record<StatEvent, number>;
	readonly days: ReadonlyArray<DayCount>;
	readonly topGallery: ReadonlyArray<TopPrompt>;
	readonly since: string | null;
};

const isStatEvent = (value: string): value is StatEvent => (STAT_EVENTS as ReadonlyArray<string>).includes(value);

const emptyTotals = (): Record<StatEvent, number> => ({ visit: 0, short_created: 0, short_opened: 0, gallery_opened: 0 });

export const utcDay = (now: Date): string => now.toISOString().slice(0, 10);

export class Stats extends DurableObject {
	constructor(ctx: DurableObjectState, env: Cloudflare.Env) {
		super(ctx, env);
		ctx.storage.sql.exec("CREATE TABLE IF NOT EXISTS daily (day TEXT NOT NULL, event TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '', count INTEGER NOT NULL, PRIMARY KEY (day, event, detail))");
	}

	record(event: StatEvent, detail: string, day: string): void {
		this.ctx.storage.sql.exec(
			"INSERT INTO daily (day, event, detail, count) VALUES (?, ?, ?, 1) ON CONFLICT (day, event, detail) DO UPDATE SET count = count + 1",
			day,
			event,
			detail,
		);
	}

	snapshot(fromDay: string): StatsSnapshot {
		const totals = emptyTotals();
		for (const row of this.ctx.storage.sql.exec<{ event: string; total: number }>("SELECT event, SUM(count) AS total FROM daily GROUP BY event")) {
			if (isStatEvent(row.event)) totals[row.event] = row.total;
		}

		const days: Array<DayCount> = [];
		for (const row of this.ctx.storage.sql.exec<{ day: string; event: string; total: number }>(
			"SELECT day, event, SUM(count) AS total FROM daily WHERE day >= ? GROUP BY day, event ORDER BY day",
			fromDay,
		)) {
			if (isStatEvent(row.event)) days.push({ day: row.day, event: row.event, count: row.total });
		}

		const topGallery = this.ctx.storage.sql
			.exec<{ detail: string; total: number }>("SELECT detail, SUM(count) AS total FROM daily WHERE event = 'gallery_opened' GROUP BY detail ORDER BY total DESC LIMIT 10")
			.toArray()
			.map((row) => ({ slug: row.detail, count: row.total }));

		const first = this.ctx.storage.sql.exec<{ day: string | null }>("SELECT MIN(day) AS day FROM daily").one();

		return { totals, days, topGallery, since: first.day };
	}
}
