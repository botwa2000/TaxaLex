/**
 * Seed script — upserts all content from contentFallbacks and creates 5 demo users.
 * Run: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import { USE_CASES, FAQS, PRICING_PLANS, TRUST_STATS } from '../src/lib/contentFallbacks'

// Prisma 7 with engineType "client" requires a driver adapter at construction time
const adapter = new PrismaPg(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

async function seedUsers() {
  console.log('Seeding users...')

  const users = [
    {
      id: 'demo_admin_001',
      email: 'admin@taxalex.de',
      name: 'Max Mustermann',
      role: 'ADMIN' as const,
      password: 'Admin1234!',
      locale: 'de',
    },
    {
      id: 'demo_advisor_001',
      email: 'advisor@demo.taxalex.de',
      name: 'Karin Müller',
      role: 'ADVISOR' as const,
      password: 'Demo1234!',
      locale: 'de',
    },
    {
      id: 'demo_lawyer_001',
      email: 'lawyer@demo.taxalex.de',
      name: 'Dr. Fischer',
      role: 'LAWYER' as const,
      password: 'Demo1234!',
      locale: 'de',
    },
    {
      id: 'demo_user_001',
      email: 'user@demo.taxalex.de',
      name: 'Anna Schmidt',
      role: 'USER' as const,
      password: 'Demo1234!',
      locale: 'de',
    },
    {
      id: 'demo_expat_001',
      email: 'expat@demo.taxalex.de',
      name: 'James Wilson',
      role: 'USER' as const,
      password: 'Demo1234!',
      locale: 'en',
    },
  ]

  for (const u of users) {
    const passwordHash = await hashPassword(u.password)
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, locale: u.locale, passwordHash },
      create: {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        locale: u.locale,
        passwordHash,
      },
    })
    console.log(`  ✓ ${u.email} (${u.role})`)
  }
}

async function seedUseCases() {
  console.log('Seeding use cases...')

  for (const uc of USE_CASES) {
    await prisma.useCase.upsert({
      where: { slug_locale: { slug: uc.slug, locale: uc.locale } },
      update: {
        title: uc.title,
        shortDesc: uc.shortDesc,
        description: uc.description,
        deadlineText: uc.deadlineText,
        deadlineDays: uc.deadlineDays,
        legalBasis: uc.legalBasis,
        successRate: uc.successRate ?? null,
        badge: uc.badge ?? null,
        icon: uc.icon ?? 'FileText',
      },
      create: {
        slug: uc.slug,
        locale: uc.locale,
        title: uc.title,
        shortDesc: uc.shortDesc,
        description: uc.description,
        deadlineText: uc.deadlineText,
        deadlineDays: uc.deadlineDays,
        legalBasis: uc.legalBasis,
        successRate: uc.successRate ?? null,
        badge: uc.badge ?? null,
        icon: uc.icon ?? 'FileText',
      },
    })
    console.log(`  ✓ ${uc.slug} [${uc.locale}]`)
  }
}

async function seedFAQs() {
  console.log('Seeding FAQs...')

  // Delete existing and re-insert (easier than upserting by content)
  await prisma.fAQ.deleteMany({})

  for (const faq of FAQS) {
    await prisma.fAQ.create({
      data: {
        locale: faq.locale,
        category: faq.category,
        userGroup: faq.userGroup ?? null,
        question: faq.question,
        answer: faq.answer,
        sortOrder: faq.sortOrder,
        isActive: true,
      },
    })
  }
  console.log(`  ✓ ${FAQS.length} FAQs seeded`)
}

async function seedPricingPlans() {
  console.log('Seeding pricing plans...')

  for (const plan of PRICING_PLANS) {
    // Upsert the plan itself
    const dbPlan = await prisma.pricingPlan.upsert({
      where: { slug: plan.slug },
      update: {
        userGroup: plan.userGroup,
        priceOnce: plan.priceOnce ?? null,
        priceMonthly: plan.priceMonthly ?? null,
        priceAnnual: plan.priceAnnual ?? null,
        currency: plan.currency,
        isPopular: plan.isPopular,
        isActive: plan.isActive,
      },
      create: {
        slug: plan.slug,
        userGroup: plan.userGroup,
        priceOnce: plan.priceOnce ?? null,
        priceMonthly: plan.priceMonthly ?? null,
        priceAnnual: plan.priceAnnual ?? null,
        currency: plan.currency,
        isPopular: plan.isPopular,
        isActive: plan.isActive,
      },
    })

    // Upsert translations
    for (const [locale, t] of Object.entries(plan.translations)) {
      await prisma.pricingPlanTranslation.upsert({
        where: { planId_locale: { planId: dbPlan.id, locale } },
        update: { name: t.name, description: t.description, cta: t.cta },
        create: {
          planId: dbPlan.id,
          locale,
          name: t.name,
          description: t.description,
          cta: t.cta,
        },
      })
    }

    // Replace features
    await prisma.pricingPlanFeature.deleteMany({ where: { planId: dbPlan.id } })
    for (const f of plan.features) {
      await prisma.pricingPlanFeature.create({
        data: {
          planId: dbPlan.id,
          locale: f.locale,
          text: f.text,
          included: f.included,
          sortOrder: f.sortOrder,
        },
      })
    }

    console.log(`  ✓ ${plan.slug}`)
  }
}

async function seedTrustStats() {
  console.log('Seeding trust stats...')

  await prisma.trustStat.deleteMany({})

  for (const [idx, stat] of TRUST_STATS.entries()) {
    await prisma.trustStat.create({
      data: {
        locale: stat.locale,
        value: stat.value,
        label: stat.label,
        source: stat.source,
        sourceUrl: stat.sourceUrl ?? null,
        verified: stat.verified,
        sortOrder: idx,
        isActive: true,
      },
    })
  }
  console.log(`  ✓ ${TRUST_STATS.length} trust stats seeded`)
}

async function main() {
  console.log('🌱 Starting seed...')

  await seedUsers()
  await seedUseCases()
  await seedFAQs()
  await seedPricingPlans()
  await seedTrustStats()

  console.log('✅ Seed complete')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
