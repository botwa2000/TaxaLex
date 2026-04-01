import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const user = await db.user.findUnique({
      where:   { id: userId },
      select:  {
        creditBalance:    true,
        stripeCustomerId: true,
        subscription:     true,
      },
    })

    // Fetch up to 10 invoices from Stripe if customer exists
    let invoices: InvoiceItem[] = []
    if (user?.stripeCustomerId) {
      const stripeInvoices = await stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit:    10,
        status:   'paid',
      }).catch(() => ({ data: [] }))

      invoices = stripeInvoices.data.map((inv) => ({
        id:         inv.id,
        number:     inv.number ?? inv.id,
        amountPaid: inv.amount_paid,
        currency:   inv.currency,
        date:       new Date(inv.created * 1000).toISOString(),
        pdfUrl:     inv.invoice_pdf ?? null,
        hostedUrl:  inv.hosted_invoice_url ?? null,
        description: inv.lines.data[0]?.description ?? null,
      }))
    }

    return NextResponse.json({
      creditBalance: user?.creditBalance ?? 0,
      subscription:  user?.subscription ?? null,
      invoices,
    })
  } catch (error) {
    logger.error('Stripe status fetch failed', { userId, error })
    return NextResponse.json({ creditBalance: 0, subscription: null, invoices: [] })
  }
}

interface InvoiceItem {
  id:          string
  number:      string
  amountPaid:  number
  currency:    string
  date:        string
  pdfUrl:      string | null
  hostedUrl:   string | null
  description: string | null
}
