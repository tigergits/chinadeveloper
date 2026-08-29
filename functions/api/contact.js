/**
 * Cloudflare Pages Function：联系表单收件（POST /api/contact）。
 *
 * Pages 部署时自动识别仓库根目录的 functions/，与 out/ 静态产物共存。
 * 环境变量（在 Cloudflare Pages 控制台配置）：
 *   - RESEND_API_KEY        必需。https://resend.com 的 API key，未配置时返回 503，
 *                           前端自动回退为 mailto。
 *   - CONTACT_TO            可选。收件邮箱，默认 tiger.hu.liu@gmail.com。
 *   - TURNSTILE_SECRET_KEY  可选。配置后校验 Cloudflare Turnstile token。
 */

const MAX_LEN = 5000

export async function onRequestPost(context) {
	const { request, env } = context

	let body
	try {
		body = await request.json()
	} catch {
		return json({ error: "invalid json" }, 400)
	}

	const name = str(body.name, 200)
	const email = str(body.email, 200)
	const message = str(body.message, MAX_LEN)
	const projectType = str(body.projectType, 100)
	const budget = str(body.budget, 100)
	const project = str(body.project, 200)

	// 蜜罐：正常用户不会填 company 字段
	if (str(body.company, 100)) return json({ ok: true }, 200)

	if (!name || !email || !message) return json({ error: "missing fields" }, 400)
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "invalid email" }, 400)

	// 可选 Turnstile 校验
	if (env.TURNSTILE_SECRET_KEY) {
		const token = str(body.turnstileToken, 2048)
		if (!token) return json({ error: "captcha required" }, 400)
		const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token }),
		})
		const outcome = await verify.json()
		if (!outcome.success) return json({ error: "captcha failed" }, 400)
	}

	if (!env.RESEND_API_KEY) return json({ error: "mail not configured" }, 503)

	const to = env.CONTACT_TO || "tiger.hu.liu@gmail.com"
	const subject = project ? `[chinadeveloper.net] ${name} — ${project}` : `[chinadeveloper.net] ${name} — new inquiry`
	const text = [
		`Name: ${name}`,
		`Email: ${email}`,
		project ? `About project: ${project}` : "",
		`Project type: ${projectType}`,
		`Budget: ${budget}`,
		"",
		message,
	]
		.filter(Boolean)
		.join("\n")

	const res = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${env.RESEND_API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from: "chinadeveloper.net <onboarding@resend.dev>",
			to: [to],
			reply_to: email,
			subject,
			text,
		}),
	})

	if (!res.ok) {
		const detail = await res.text()
		console.error("resend failed:", res.status, detail)
		return json({ error: "send failed" }, 502)
	}
	return json({ ok: true }, 200)
}

function str(v, max) {
	return typeof v === "string" ? v.trim().slice(0, max) : ""
}

function json(obj, status) {
	return new Response(JSON.stringify(obj), {
		status,
		headers: { "Content-Type": "application/json" },
	})
}
