import { setRequestLocale } from "next-intl/server"
import { Locale } from "@/i18n/request"

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
	const { locale } = await params
	const title = "Privacy Policy - China Developer"
	const description = "Privacy Policy for chinadeveloper.net websites, web applications, and Google Chrome extensions. How we collect, use, and protect your data."

	return {
		title,
		description,
		authors: [{ name: "Tiger Liu", url: "https://chinadeveloper.net" }],
		alternates: {
			canonical: `https://chinadeveloper.net/${locale}/privacy`,
		},
		openGraph: {
			title,
			description,
			type: "website",
			url: `https://chinadeveloper.net/${locale}/privacy`,
			siteName: "China Developer - Tiger Liu",
		},
		twitter: {
			card: "summary",
			title,
			description,
		},
	}
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: Locale }> }) {
	const { locale } = await params
	setRequestLocale(locale)

	return (
		<div className="container px-4 py-12 md:py-16">
			<div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
				<h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
				<p className="text-muted-foreground text-sm">
					Last updated: February 8, 2025
				</p>

				<section className="mt-8">
					<h2 className="text-xl font-semibold mt-6 mb-2">1. Introduction</h2>
					<p>
						China Developer (“we,” “our,” or “us”) operates the website <strong>chinadeveloper.net</strong>, related web applications, and Google Chrome extensions (collectively, the “Services”). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Services. By using our Services, you agree to the practices described in this policy.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-6 mb-2">2. Scope</h2>
					<p>
						This Privacy Policy applies to:
					</p>
					<ul className="list-disc pl-6 space-y-1 mt-2">
						<li>The website chinadeveloper.net and any subdomains</li>
						<li>Web applications published by China Developer and accessible via browser or other clients</li>
						<li>Google Chrome extensions published by China Developer (or under developer accounts associated with chinadeveloper.net)</li>
						<li>Any other apps or digital products that link to this policy</li>
					</ul>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-6 mb-2">3. Information We Collect</h2>
					<p className="mb-2">
						We may collect the following categories of information:
					</p>
					<ul className="list-disc pl-6 space-y-1">
						<li><strong>Usage data:</strong> How you interact with our website, web app, or extension (e.g., pages visited, features used, general usage statistics). This may include technical data such as browser type, device type, and approximate location (e.g., country) where relevant to the service.</li>
						<li><strong>Data you provide:</strong> Information you voluntarily submit (e.g., contact forms, support requests, or in-app inputs). We do not require account registration for most of our Services unless explicitly stated.</li>
						<li><strong>Chrome extension–specific data:</strong> Our Chrome extensions may access only the data necessary for their stated purpose (e.g., page content or storage within the extension). Each extension’s permission justification is described in the Chrome Web Store listing. We do not collect personal data beyond what is needed for the extension’s single purpose unless clearly disclosed.</li>
						<li><strong>Cookies and similar technologies:</strong> We may use cookies, local storage, or similar technologies for functionality, preferences, and analytics as described in Section 6.</li>
					</ul>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-6 mb-2">4. How We Use Your Information</h2>
					<p>
						We use collected information to:
					</p>
					<ul className="list-disc pl-6 space-y-1 mt-2">
						<li>Provide, operate, and improve our Services</li>
						<li>Understand how our Services are used and fix issues</li>
						<li>Respond to your inquiries and support requests</li>
						<li>Comply with applicable laws and protect our rights</li>
						<li>Send you updates or communications only where you have agreed or where permitted by law</li>
					</ul>
					<p className="mt-4">
						We do not sell your personal information. We do not use your data for purposes unrelated to the Services without your consent.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-6 mb-2">5. Data Sharing and Disclosure</h2>
					<p>
						We may share your information only in the following circumstances:
					</p>
					<ul className="list-disc pl-6 space-y-1 mt-2">
						<li><strong>Service providers:</strong> With trusted third parties who assist in operating our Services (e.g., hosting, analytics) under strict confidentiality and data-processing agreements.</li>
						<li><strong>Legal requirements:</strong> When required by law, court order, or government request, or to protect our rights, safety, or property.</li>
						<li><strong>With your consent:</strong> Where you have given explicit consent for a specific disclosure.</li>
					</ul>
					<p className="mt-4">
						We do not sell, rent, or trade your personal information to third parties for marketing purposes.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-6 mb-2">6. Cookies and Similar Technologies</h2>
					<p>
						Our website and web apps may use cookies and similar technologies (e.g., local storage) to:
					</p>
					<ul className="list-disc pl-6 space-y-1 mt-2">
						<li>Remember your preferences (e.g., language, theme)</li>
						<li>Analyze traffic and usage (e.g., via Google Analytics or similar, where used)</li>
						<li>Ensure security and proper functioning of the Services</li>
					</ul>
					<p className="mt-4">
						You can control cookies through your browser settings. Disabling certain cookies may affect the functionality of our Services.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-6 mb-2">7. Data Retention</h2>
					<p>
						We retain your information only for as long as necessary to fulfill the purposes described in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. Usage and analytics data may be retained in aggregated or anonymized form for longer periods.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-6 mb-2">8. Security</h2>
					<p>
						We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. No method of transmission or storage is 100% secure; we cannot guarantee absolute security.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-6 mb-2">9. Your Rights and Choices</h2>
					<p>
						Depending on your location, you may have the right to:
					</p>
					<ul className="list-disc pl-6 space-y-1 mt-2">
						<li>Access and receive a copy of the personal data we hold about you</li>
						<li>Correct or update inaccurate personal data</li>
						<li>Request deletion of your personal data</li>
						<li>Object to or restrict certain processing</li>
						<li>Data portability, where applicable</li>
						<li>Withdraw consent where processing is based on consent</li>
						<li>Lodge a complaint with a supervisory authority</li>
					</ul>
					<p className="mt-4">
						To exercise these rights or ask questions about your data, contact us using the details in Section 12.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-6 mb-2">10. Children’s Privacy</h2>
					<p>
						Our Services are not directed to individuals under the age of 13 (or higher where required by local law). We do not knowingly collect personal information from children. If you believe we have collected such information, please contact us and we will take steps to delete it.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-6 mb-2">11. International Transfers</h2>
					<p>
						Your information may be processed in countries other than your own. We ensure that such transfers are subject to appropriate safeguards (e.g., standard contractual clauses or adequacy decisions) where required by applicable law.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-6 mb-2">12. Changes to This Policy</h2>
					<p>
						We may update this Privacy Policy from time to time. We will post the revised policy on this page and update the “Last updated” date. For material changes, we may provide additional notice (e.g., on our website or via the Chrome Web Store listing). Continued use of our Services after changes constitutes acceptance of the updated policy.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-6 mb-2">13. Contact Us</h2>
					<p>
						If you have questions about this Privacy Policy or our data practices, or wish to exercise your rights, please contact us:
					</p>
					<ul className="list-none pl-0 mt-2 space-y-1">
						<li><strong>Data controller:</strong> China Developer (chinadeveloper.net)</li>
						<li><strong>Website:</strong> <a href="https://chinadeveloper.net" className="text-primary hover:underline">https://chinadeveloper.net</a></li>
						<li><strong>Contact page:</strong> <a href="https://chinadeveloper.net/en/contact" className="text-primary hover:underline">https://chinadeveloper.net/en/contact</a></li>
					</ul>
					<p className="mt-4">
						We will respond to your request within a reasonable period as required by applicable law.
					</p>
				</section>

				<p className="mt-10 text-sm text-muted-foreground border-t pt-6">
					© {new Date().getFullYear()} China Developer. All rights reserved.
				</p>
			</div>
		</div>
	)
}
