import { redirect } from 'next/navigation'

export default async function FuerSteuerberaterRedirect({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/advisor`)
}
