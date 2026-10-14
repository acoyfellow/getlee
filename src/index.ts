const SECURITY_HEADERS: Record<string, string> = {
	"content-security-policy":
		"default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
	"referrer-policy": "no-referrer",
	"x-content-type-options": "nosniff",
	"permissions-policy": "camera=(), microphone=(), geolocation=()",
};

const withSecurityHeaders = (response: Response): Response => {
	const secured = new Response(response.body, response);

	for (const [name, value] of Object.entries(SECURITY_HEADERS)) secured.headers.set(name, value);

	return secured;
};

export default {
	async fetch(request, env): Promise<Response> {
		return withSecurityHeaders(await env.ASSETS.fetch(request));
	},
} satisfies ExportedHandler<{ ASSETS: Fetcher }>;
